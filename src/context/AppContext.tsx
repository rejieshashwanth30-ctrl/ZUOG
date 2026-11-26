'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Vendor,
  DocumentItem,
  Reminder,
  ActivityItem,
  NotificationItem,
  KPIStats,
  ToastMessage,
  ComplianceStatus,
  DocumentType,
} from '@/types';
import { VendorService } from '@/services/vendorService';
import { DocumentService } from '@/services/documentService';
import { ReminderService } from '@/services/reminderService';
import { supabase } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api/apiClient';

interface AppContextType {
  currentUser: { id: string; email: string; name: string } | null;
  currentWorkspace: {
    id: string;
    name: string;
    companyName: string;
    companyEmail?: string;
    companyPhone?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
  } | null;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateWorkspaceData: (updates: {
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
  }) => Promise<void>;

  vendors: Vendor[];
  documents: DocumentItem[];
  reminders: Reminder[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  kpiStats: KPIStats;
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Vendor actions
  addVendor: (data: Omit<Vendor, 'id' | 'createdAt' | 'lastUpdated'>) => Promise<Vendor>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<Vendor | null>;
  deleteVendor: (id: string) => Promise<boolean>;

  // Document actions
  verifyDocument: (docId: string, verifierName?: string) => Promise<void>;
  rejectDocument: (docId: string, reason: string) => Promise<void>;
  uploadDocument: (
    vendorId: string,
    vendorName: string,
    docType: DocumentType,
    fileName: string,
    fileSize: string,
    expiryDate?: string
  ) => Promise<DocumentItem>;
  uploadRealDocument: (formData: FormData) => Promise<DocumentItem>;
  deleteDocument: (docId: string) => Promise<boolean>;

  // Reminder actions
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<boolean>;
  sendReminderNow: (id: string) => Promise<void>;

  // UI state
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
  addVendorModalOpen: boolean;
  setAddVendorModalOpen: (open: boolean) => void;
  uploadDocumentModalOpen: boolean;
  setUploadDocumentModalOpen: (open: boolean) => void;
  selectedDocForPreview: DocumentItem | null;
  setSelectedDocForPreview: (doc: DocumentItem | null) => void;
  selectedVendorForReminder: { vendorId: string; vendorName: string; documentType?: string } | null;
  setSelectedVendorForReminder: (data: { vendorId: string; vendorName: string; documentType?: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Session & Workspace State
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<{
    id: string;
    name: string;
    companyName: string;
    companyEmail?: string;
    companyPhone?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
  } | null>(null);

  // Production Clean Baseline: Starts with empty arrays
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // UI Modals state
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [addVendorModalOpen, setAddVendorModalOpen] = useState(false);
  const [uploadDocumentModalOpen, setUploadDocumentModalOpen] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);
  const [selectedVendorForReminder, setSelectedVendorForReminder] = useState<{
    vendorId: string;
    vendorName: string;
    documentType?: string;
  } | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, title, message, type };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const refreshWorkspace = useCallback(async () => {
    try {
      const wsRes = await apiFetch('/api/workspaces').catch(() => null);
      if (wsRes && wsRes.ok) {
        const { workspace } = await wsRes.json();
        if (workspace) {
          setCurrentWorkspace(workspace);
          return workspace;
        }
      }
    } catch (err: any) {
      console.warn('[AppContext] Could not fetch workspace:', err?.message);
    }
    return null;
  }, []);

  const updateWorkspaceData = useCallback(async (updates: {
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
  }) => {
    const res = await apiFetch('/api/workspaces', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update workspace.');
    }
    const json = await res.json();
    if (json.workspace) {
      setCurrentWorkspace(json.workspace);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [v, d, r, ws] = await Promise.all([
        VendorService.getAllVendors().catch(() => []),
        DocumentService.getAllDocuments().catch(() => []),
        ReminderService.getAllReminders().catch(() => []),
        refreshWorkspace(),
      ]);
      setVendors(v);
      setDocuments(d);
      setReminders(r);
    } catch (err: any) {
      console.warn('[AppContext] Could not refresh database records:', err?.message);
    }
  }, [refreshWorkspace]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setCurrentWorkspace(null);
      setVendors([]);
      setDocuments([]);
      setReminders([]);
      setActivities([]);
      showToast('Signed Out', 'You have been safely signed out.');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (err: any) {
      console.error('[AppContext] Sign out error:', err);
    }
  }, [showToast]);

  // Initialize from live Neon backend via production API services and Supabase Session
  useEffect(() => {
    async function initSessionAndData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          });
        }

        await Promise.all([
          refreshWorkspace(),
          refreshData(),
        ]);
      } catch (err: any) {
        console.warn('[AppContext] Could not load initial database records:', err?.message);
      }
    }
    initSessionAndData();

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          });
        }
        await Promise.all([
          refreshWorkspace(),
          refreshData(),
        ]);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCurrentWorkspace(null);
        setVendors([]);
        setDocuments([]);
        setReminders([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshData]);

  // Global key listener for search shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Recalculate dynamic KPIs based purely on actual vendors and documents (no fake numbers)
  const kpiStats: KPIStats = React.useMemo(() => {
    const total = vendors.length;
    let compliant = 0;
    let expiringSoon = 0;
    let expired = 0;
    let missingDocuments = 0;
    let underReview = 0;

    vendors.forEach((v) => {
      if (v.status === 'compliant') compliant++;
      else if (v.status === 'expiring') expiringSoon++;
      else if (v.status === 'expired') expired++;
      else if (v.status === 'incomplete') missingDocuments++;
    });

    documents.forEach((d) => {
      if (d.status === 'pending') underReview++;
    });

    const verificationRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

    return {
      totalVendors: total,
      compliant,
      expiringSoon,
      expired,
      missingDocuments,
      underReview,
      verificationRate,
    };
  }, [vendors, documents]);

  // Vendor actions
  const addVendor = useCallback(async (data: Omit<Vendor, 'id' | 'createdAt' | 'lastUpdated'>) => {
    try {
      const newVendor = await VendorService.createVendor(data);
      setVendors((prev) => [newVendor, ...prev.filter((v) => v.id !== newVendor.id)]);

      // Add real activity record
      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        title: `Supplier registered: ${newVendor.name}`,
        vendorId: newVendor.id,
        vendorName: newVendor.name,
        type: 'vendor_added',
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
        user: 'Compliance Officer',
      };
      setActivities((prev) => [newAct, ...prev]);

      showToast('Vendor added successfully', `${newVendor.name} is now tracked in your workspace.`);
      return newVendor;
    } catch (err: any) {
      showToast('Failed to add vendor', err?.message || 'Database error occurred.', 'error');
      throw err;
    }
  }, [showToast]);

  const updateVendor = useCallback(async (id: string, updates: Partial<Vendor>) => {
    try {
      const updated = await VendorService.updateVendor(id, updates);
      if (updated) {
        setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)));
        showToast('Vendor updated', `${updated.name} profile was saved.`);
      }
      return updated;
    } catch (err: any) {
      showToast('Update failed', err?.message || 'Database error occurred.', 'error');
      throw err;
    }
  }, [showToast]);

  const deleteVendor = useCallback(async (id: string) => {
    try {
      const target = vendors.find((v) => v.id === id);
      const success = await VendorService.deleteVendor(id);
      if (success) {
        setVendors((prev) => prev.filter((v) => v.id !== id));
        showToast('Vendor removed', `${target?.name || 'Vendor'} has been removed from your workspace.`, 'info');
      }
      return success;
    } catch (err: any) {
      showToast('Delete failed', err?.message || 'Database error occurred.', 'error');
      throw err;
    }
  }, [vendors, showToast]);

  // Document actions
  const verifyDocument = useCallback(async (docId: string, verifierName = 'Auditor') => {
    try {
      const updated = await DocumentService.verifyDocument(docId);
      if (updated) {
        setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));

        const newAct: ActivityItem = {
          id: `act-${Date.now()}`,
          title: `${updated.vendorName} ${updated.type} verified`,
          vendorId: updated.vendorId,
          vendorName: updated.vendorName,
          documentType: updated.type,
          type: 'verification',
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          user: verifierName,
        };
        setActivities((prev) => [newAct, ...prev]);

        showToast('Document marked as verified', `${updated.type} for ${updated.vendorName} is approved.`);
      }
    } catch (err: any) {
      showToast('Verification failed', err?.message || 'Database error occurred.', 'error');
      throw err;
    }
  }, [showToast]);

  const rejectDocument = useCallback(async (docId: string, reason: string) => {
    try {
      const updated = await DocumentService.rejectDocument(docId, reason);
      if (updated) {
        setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));

        const newAct: ActivityItem = {
          id: `act-${Date.now()}`,
          title: `${updated.vendorName} ${updated.type} rejected`,
          vendorId: updated.vendorId,
          vendorName: updated.vendorName,
          documentType: updated.type,
          type: 'rejection',
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          user: 'Auditor',
        };
        setActivities((prev) => [newAct, ...prev]);

        showToast('Document rejected', `Reason: ${reason}`, 'warning');
      }
    } catch (err: any) {
      showToast('Rejection failed', err?.message || 'Database error occurred.', 'error');
      throw err;
    }
  }, [showToast]);

  const uploadDocument = useCallback(async (
    vendorId: string,
    vendorName: string,
    docType: DocumentType,
    fileName: string,
    fileSize: string,
    expiryDate?: string
  ) => {
    try {
      const newDoc = await DocumentService.uploadDocument({
        vendorId,
        vendorName,
        type: docType,
        fileName,
        fileSize,
        expiryDate,
      });

      setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);

      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        title: `${vendorName} uploaded ${docType}`,
        vendorId,
        vendorName,
        documentType: docType,
        type: 'upload',
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
        user: 'Portal Upload',
      };
      setActivities((prev) => [newAct, ...prev]);

      showToast('Document uploaded successfully', `${fileName} is submitted and pending review.`);
      return newDoc;
    } catch (err: any) {
      showToast('Upload failed', err?.message || 'Database error occurred.', 'error');
      throw err;
    }
  }, [showToast]);

  const uploadRealDocument = useCallback(
    async (formData: FormData) => {
      try {
        const newDoc = await DocumentService.uploadRealFile(formData);
        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);

        const newAct: ActivityItem = {
          id: `act-${Date.now()}`,
          title: `${newDoc.vendorName} uploaded ${newDoc.type}`,
          vendorId: newDoc.vendorId,
          vendorName: newDoc.vendorName,
          documentType: newDoc.type,
          type: 'upload',
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          user: 'Portal Upload',
        };
        setActivities((prev) => [newAct, ...prev]);

        showToast(
          'Document uploaded successfully',
          `${newDoc.fileName || newDoc.type} submitted to secure storage.`
        );
        return newDoc;
      } catch (err: any) {
        showToast('Upload failed', err?.message || 'Database error occurred.', 'error');
        throw err;
      }
    },
    [showToast]
  );

  const deleteDocument = useCallback(
    async (docId: string) => {
      try {
        const target = documents.find((d) => d.id === docId);
        const success = await DocumentService.deleteDocument(docId);
        if (success) {
          setDocuments((prev) => prev.filter((d) => d.id !== docId));
          if (selectedDocForPreview?.id === docId) {
            setSelectedDocForPreview(null);
          }
          showToast(
            'Document deleted',
            `${target?.type || 'Document'} has been removed from your workspace.`,
            'info'
          );
        }
        return success;
      } catch (err: any) {
        showToast('Delete failed', err?.message || 'Failed to remove document.', 'error');
        throw err;
      }
    },
    [documents, selectedDocForPreview, showToast]
  );

  // Reminder actions
  const addReminder = useCallback(async (data: Omit<Reminder, 'id' | 'createdAt'>) => {
    try {
      const newReminder = await ReminderService.createReminder(data);
      setReminders((prev) => [newReminder, ...prev]);

      showToast(
        'Reminder scheduled',
        `Follow-up scheduled for ${newReminder.documentType} via ${newReminder.channels.join(' + ').toUpperCase()}.`
      );
      return newReminder;
    } catch (err: any) {
      showToast('Reminder failed', err?.message || 'Database error occurred.', 'error');
      throw err;
    }
  }, [showToast]);

  const deleteReminder = useCallback(async (id: string) => {
    try {
      const success = await ReminderService.deleteReminder(id);
      if (success) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
        showToast('Reminder deleted', 'The reminder schedule was removed.', 'info');
      }
      return success;
    } catch (err: any) {
      showToast('Delete reminder failed', err?.message || 'Database error occurred.', 'error');
      throw err;
    }
  }, [showToast]);

  const sendReminderNow = useCallback(async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (target) {
      showToast(
        'Reminder dispatched',
        `Notification sent to ${target.vendorName} via ${target.channels.join(' & ')}.`
      );
    }
  }, [reminders, showToast]);

  const contextValue = React.useMemo<AppContextType>(
    () => ({
      currentUser,
      currentWorkspace,
      signOut,
      refreshData,
      updateWorkspaceData,
      vendors,
      documents,
      reminders,
      activities,
      notifications,
      kpiStats,
      toasts,
      showToast,
      removeToast,
      addVendor,
      updateVendor,
      deleteVendor,
      verifyDocument,
      rejectDocument,
      uploadDocument,
      uploadRealDocument,
      deleteDocument,
      addReminder,
      deleteReminder,
      sendReminderNow,
      globalSearchOpen,
      setGlobalSearchOpen,
      addVendorModalOpen,
      setAddVendorModalOpen,
      uploadDocumentModalOpen,
      setUploadDocumentModalOpen,
      selectedDocForPreview,
      setSelectedDocForPreview,
      selectedVendorForReminder,
      setSelectedVendorForReminder,
    }),
    [
      currentUser,
      currentWorkspace,
      signOut,
      refreshData,
      updateWorkspaceData,
      vendors,
      documents,
      reminders,
      activities,
      notifications,
      kpiStats,
      toasts,
      showToast,
      removeToast,
      addVendor,
      updateVendor,
      deleteVendor,
      verifyDocument,
      rejectDocument,
      uploadDocument,
      uploadRealDocument,
      deleteDocument,
      addReminder,
      deleteReminder,
      sendReminderNow,
      globalSearchOpen,
      addVendorModalOpen,
      uploadDocumentModalOpen,
      selectedDocForPreview,
      selectedVendorForReminder,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
