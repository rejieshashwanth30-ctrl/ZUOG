import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage/storageService';
import { getAuthenticatedUser } from '@/lib/supabase/server';


/**
 * GET /api/documents/file
 * Serves private document binaries using cryptographically signed short-lived URLs or session checks.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    const expiresStr = url.searchParams.get('expires');
    const signature = url.searchParams.get('sig');
    const isDownload = url.searchParams.get('download') === 'true';

    if (!key) {
      return NextResponse.json({ error: 'Missing storage key.' }, { status: 400 });
    }

    let isAuthorized = false;

    // 1. Verify signed token signature
    if (expiresStr && signature) {
      const expires = parseInt(expiresStr, 10);
      if (!isNaN(expires)) {
        isAuthorized = StorageService.verifyLocalSignature(key, expires, signature);
      }
    }

    // 2. If token signature check is not present or failed, check user session
    if (!isAuthorized) {
      const authUser = await getAuthenticatedUser(request);
      if (authUser) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized or signed download link has expired.' },
        { status: 403 }
      );
    }

    // 3. Retrieve file buffer from storage
    const fileData = await StorageService.getFileBuffer(key);
    if (!fileData) {
      return NextResponse.json({ error: 'File not found in storage.' }, { status: 404 });
    }

    const fileName = key.split('/').pop() || 'document';
    const dispositionType = isDownload ? 'attachment' : 'inline';

    return new NextResponse(fileData.buffer as any, {
      status: 200,
      headers: {
        'Content-Type': fileData.mimeType,
        'Content-Length': fileData.size.toString(),
        'Content-Disposition': `${dispositionType}; filename="${encodeURIComponent(fileName)}"`,
        'Cache-Control': 'private, max-age=900',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('[API /api/documents/file GET] Stream error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error streaming document.' },
      { status: 500 }
    );
  }
}
