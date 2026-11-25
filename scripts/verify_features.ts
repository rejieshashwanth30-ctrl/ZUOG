import { prisma } from '../src/lib/db/prisma';
import { UserRepository } from '../src/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '../src/lib/db/repositories/workspaceRepository';
import { VendorRepository } from '../src/lib/db/repositories/vendorRepository';
import { DocumentRepository } from '../src/lib/db/repositories/documentRepository';
import { StorageService } from '../src/lib/storage/storageService';
import { LocalStorageProvider } from '../src/lib/storage/providers/LocalStorageProvider';

async function runVerification() {
  console.log('====================================================');
  console.log('ADYK ZUOG — E2E PRODUCTION VERIFICATION SUITE');
  console.log('Testing Feature 1: Real Document Upload & Secure Storage');
  console.log('Testing Feature 2: Persistent Account & Returning User Flow');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}`);
      if (details) console.error(`       Details: ${details}`);
    }
  }

  try {
    // ----------------------------------------------------
    // TEST GROUP 1: Database Health Check
    // ----------------------------------------------------
    console.log('--- Test Group 1: Database Connection ---');
    const healthResult = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;
    assert(healthResult[0]?.ok === 1, 'Neon PostgreSQL SELECT 1 Health Check');

    // ----------------------------------------------------
    // TEST GROUP 2: Persistent Account & Returning User Flow
    // ----------------------------------------------------
    console.log('\n--- Test Group 2: Account Persistence & Returning User Flow ---');
    const testAuthIdA = `auth-test-user-a-${Date.now()}`;
    const testEmailA = `owner-a-${Date.now()}@testcompany.in`;

    // 1. Initial Signup: Sync Supabase user into Neon
    const userA1 = await UserRepository.syncAuthUser({
      authUserId: testAuthIdA,
      email: testEmailA,
      fullName: 'Vikram Sharma',
    });
    assert(Boolean(userA1?.id), 'Initial user signup creates User record in Neon', `User ID: ${userA1.id}`);

    // 2. Initial Workspace creation: Create organization workspace with Owner role
    const workspaceA = await WorkspaceRepository.createWorkspace({
      ownerId: userA1.id,
      name: 'Sharma Precision Engineering',
      companyName: 'Sharma Precision Engineering Pvt Ltd',
      companyEmail: testEmailA,
      companyPhone: '+91 98401 12345',
    });
    assert(Boolean(workspaceA?.id), 'Workspace creation creates Workspace in Neon with OWNER membership', `Workspace ID: ${workspaceA.id}`);

    // Verify document catalog was seeded
    const catalogCount = await prisma.documentType.count({
      where: { workspaceId: workspaceA.id },
    });
    assert(catalogCount === 9, 'Default statutory document catalog seeded with 9 standard certificates', `Count: ${catalogCount}`);

    // 3. Returning User Login Test:
    // When returning user logs in with the SAME authUserId, syncAuthUser must return the EXISTING user
    const userA_returning = await UserRepository.syncAuthUser({
      authUserId: testAuthIdA,
      email: testEmailA,
      fullName: 'Vikram Sharma',
    });
    assert(userA_returning.id === userA1.id, 'Returning login returns existing Neon User (No duplicate user record created)');

    // 4. Resolve existing workspace for returning user
    const resolvedWorkspaceA = await WorkspaceRepository.getWorkspaceForUser(userA_returning.id);
    assert(
      resolvedWorkspaceA?.id === workspaceA.id,
      'Returning login resolves existing organization workspace (No duplicate workspace created)'
    );

    // ----------------------------------------------------
    // TEST GROUP 3: Multi-Tenant Data Isolation
    // ----------------------------------------------------
    console.log('\n--- Test Group 3: Multi-Tenant Isolation ---');
    const testAuthIdB = `auth-test-user-b-${Date.now()}`;
    const testEmailB = `owner-b-${Date.now()}@competitor.in`;

    const userB = await UserRepository.syncAuthUser({
      authUserId: testAuthIdB,
      email: testEmailB,
      fullName: 'Ananya Patel',
    });

    const workspaceB = await WorkspaceRepository.createWorkspace({
      ownerId: userB.id,
      name: 'Patel Toolings',
      companyName: 'Patel Toolings LLP',
      companyEmail: testEmailB,
    });

    // Verify User A has access to Workspace A, but NOT Workspace B
    const userA_has_wsA = await WorkspaceRepository.verifyUserWorkspaceAccess(userA1.id, workspaceA.id);
    const userA_has_wsB = await WorkspaceRepository.verifyUserWorkspaceAccess(userA1.id, workspaceB.id);

    assert(userA_has_wsA === true, 'User A has verified access to their own Workspace A');
    assert(userA_has_wsB === false, 'User A is strictly DENIED access to User B Workspace (Zero Cross-Tenant Leakage)');

    // ----------------------------------------------------
    // TEST GROUP 4: Real Document Upload & Object Storage
    // ----------------------------------------------------
    console.log('\n--- Test Group 4: Real File Upload & Private Storage ---');

    // Create a real vendor in Workspace A
    const vendorA = await VendorRepository.createVendor(workspaceA.id, userA1.id, {
      vendorName: 'Apex Fasteners Ltd',
      contactPerson: 'Suresh Kumar',
      email: 'suresh@apexfasteners.com',
      phone: '+91 99887 76655',
      category: 'Fasteners & Hardware',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
    });
    assert(Boolean(vendorA?.id), 'Vendor created in Workspace A', `Vendor ID: ${vendorA.id}`);

    // Get a document type from catalog
    const gstDocType = await prisma.documentType.findFirst({
      where: { workspaceId: workspaceA.id, code: 'gst_certificate' },
    });
    assert(Boolean(gstDocType?.id), 'GST Certificate document type resolved from workspace catalog');

    // Simulate uploading a real PDF buffer
    const mockPdfBinary = Buffer.from('%PDF-1.4 Mock valid PDF compliance document binary stream for ADYK ZUOG testing');
    const storageKey = StorageService.generateStorageKey(
      workspaceA.id,
      vendorA.id,
      'doc-test-uuid',
      'Apex_GST_Certificate_2026.pdf'
    );

    const storedFile = await StorageService.uploadFile(
      mockPdfBinary,
      workspaceA.id,
      vendorA.id,
      'doc-test-uuid',
      'Apex_GST_Certificate_2026.pdf',
      'application/pdf'
    );

    assert(Boolean(storedFile?.storageKey), 'File binary saved to private storage', `Key: ${storedFile.storageKey}`);
    assert(storedFile.sizeBytes === mockPdfBinary.length, 'Stored file size matches byte-for-byte binary size');

    // Record document in Neon
    const docRecord = await DocumentRepository.uploadDocument(
      workspaceA.id,
      vendorA.id,
      gstDocType!.id,
      {
        fileName: 'Apex_GST_Certificate_2026.pdf',
        fileSize: '1.2 MB',
        storagePath: storedFile.storageKey,
        mimeType: storedFile.mimeType,
        documentNumber: '33AAACA0000A1Z5',
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days in future -> VALID
      },
      userA1.id
    );

    assert(Boolean(docRecord?.id), 'Document record inserted into Neon PostgreSQL', `Doc ID: ${docRecord.id}`);
    assert(docRecord.verificationStatus === 'PENDING', 'Initial document status is PENDING verification');
    assert(docRecord.status === 'VALID', 'Expiry calculation: 60 days remaining is VALID');

    // ----------------------------------------------------
    // TEST GROUP 5: Short-Lived Signed URL Verification
    // ----------------------------------------------------
    console.log('\n--- Test Group 5: Private Access & Cryptographic Signed URLs ---');

    const signedUrl = await StorageService.getSignedUrl(storedFile.storageKey, 3600);
    assert(Boolean(signedUrl && signedUrl.includes('sig=') && signedUrl.includes('expires=')), 'Signed URL generated with cryptographic HMAC signature');

    // Verify signature check function
    const urlObj = new URL(signedUrl!, 'http://localhost');
    const sig = urlObj.searchParams.get('sig')!;
    const expires = parseInt(urlObj.searchParams.get('expires')!, 10);

    const isSigValid = StorageService.verifyLocalSignature(storedFile.storageKey, expires, sig);
    assert(isSigValid === true, 'Cryptographic signature verified successfully for authorized request');

    const isTamperedInvalid = StorageService.verifyLocalSignature(storedFile.storageKey, expires, 'tampered-signature-xyz');
    assert(isTamperedInvalid === false, 'Tampered signature is strictly REJECTED');

    // ----------------------------------------------------
    // TEST GROUP 6: Verification, Rejection & Deletion Lifecycle
    // ----------------------------------------------------
    console.log('\n--- Test Group 6: Verification, Rejection & Secure Deletion ---');

    // Verify document
    const verifiedDoc = await DocumentRepository.verifyDocument(workspaceA.id, docRecord.id, 'Auditor Vikram', userA1.id);
    assert(verifiedDoc?.verificationStatus === 'VERIFIED', 'Document verified by Auditor / Admin in Neon');

    // Rejection test
    const rejectedDoc = await DocumentRepository.rejectDocument(workspaceA.id, docRecord.id, 'Seal stamp unclear', userA1.id);
    assert(rejectedDoc?.verificationStatus === 'REJECTED', 'Document rejected with recorded reason');
    assert(rejectedDoc?.rejectionReason === 'Seal stamp unclear', 'Rejection reason preserved in Neon database');

    // Secure Deletion test: delete DB record + object storage file
    const fileDeletedFromStorage = await StorageService.deleteFile(storedFile.storageKey);
    assert(fileDeletedFromStorage === true, 'File binary purged from private object storage');

    await DocumentRepository.deleteDocument(workspaceA.id, docRecord.id, userA1.id);
    const deletedDocCheck = await DocumentRepository.getDocumentById(workspaceA.id, docRecord.id);
    assert(deletedDocCheck === null, 'Document record permanently removed from Neon PostgreSQL');

    // ----------------------------------------------------
    // CLEANUP TEST DATA
    // ----------------------------------------------------
    console.log('\n--- Cleaning up temporary test artifacts ---');
    await prisma.vendor.delete({ where: { id: vendorA.id } });
    await prisma.workspaceMember.deleteMany({ where: { workspaceId: { in: [workspaceA.id, workspaceB.id] } } });
    await prisma.documentType.deleteMany({ where: { workspaceId: { in: [workspaceA.id, workspaceB.id] } } });
    await prisma.auditLog.deleteMany({ where: { workspaceId: { in: [workspaceA.id, workspaceB.id] } } });
    await prisma.workspace.deleteMany({ where: { id: { in: [workspaceA.id, workspaceB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA1.id, userB.id] } } });
    console.log('Cleanup completed cleanly.');

    console.log('\n====================================================');
    console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Verification failed with unhandled error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
