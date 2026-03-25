"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  getAllCards,
  getAllUsers,
  deleteCard,
  reassignCard,
  updateBusinessCard,
} from "@/lib/firestore";
import type { CardWithId, UserWithId } from "@/lib/firestore";
import type { BusinessCard } from "@/types/user";
import AdminRoute from "@/components/AdminRoute";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminPanelContent />
    </AdminRoute>
  );
}

// ─────────────────────────────────────────────
// Admin Panel
// ─────────────────────────────────────────────

function AdminPanelContent() {
  const { user } = useAuth();

  const [cards, setCards] = useState<CardWithId[]>([]);
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [assignModal, setAssignModal] = useState<CardWithId | null>(null);
  const [assignTarget, setAssignTarget] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createTargetUser, setCreateTargetUser] = useState("");

  // Load data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [allCards, allUsers] = await Promise.all([getAllCards(), getAllUsers()]);
      setCards(allCards);
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build user map for quick lookups
  const userMap = useMemo(() => {
    const map = new Map<string, UserWithId>();
    users.forEach((u) => map.set(u.uid, u));
    return map;
  }, [users]);

  // Filter cards by search
  const filteredCards = useMemo(() => {
    if (!search.trim()) return cards;
    const q = search.toLowerCase();
    return cards.filter((c) => {
      const owner = userMap.get(c.id);
      return (
        c.displayName?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        owner?.email?.toLowerCase().includes(q) ||
        owner?.name?.toLowerCase().includes(q)
      );
    });
  }, [cards, search, userMap]);

  // ── Actions ──

  const handleDelete = async (uid: string) => {
    setActionLoading(uid);
    try {
      await deleteCard(uid);
      setCards((prev) => prev.filter((c) => c.id !== uid));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssign = async () => {
    if (!assignModal || !assignTarget) return;
    setActionLoading(assignModal.id);
    try {
      await reassignCard(assignModal.id, assignTarget);
      await fetchData();
      setAssignModal(null);
      setAssignTarget("");
    } catch (err) {
      console.error("Assign failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    const targetUid = createTargetUser || `admin-${Date.now()}`;
    setActionLoading("create");
    try {
      const newCard: Omit<BusinessCard, "updatedAt"> = {
        displayName: createName.trim(),
        title: createTitle.trim(),
        phone: "",
        email: "",
        profileImage: "",
        socialLinks: [],
        customLinks: [],
      };
      await updateBusinessCard(targetUid, newCard);
      await fetchData();
      setCreateModal(false);
      setCreateName("");
      setCreateTitle("");
      setCreateTargetUser("");
    } catch (err) {
      console.error("Create failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ──

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNavbar />

      <main className="card-enter mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage all {cards.length} card{cards.length !== 1 && "s"} across the platform
            </p>
          </div>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#F15928] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#d94d22] hover:shadow-lg hover:shadow-[#F15928]/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Card
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, slug, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-[#F15928]/40 focus:ring-1 focus:ring-[#F15928]/20"
            />
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-[#F15928]" />
              <p className="text-sm text-gray-400">Loading cards…</p>
            </div>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-20">
            <svg className="mb-4 h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
            </svg>
            <p className="text-sm text-gray-400">
              {search ? "No cards match your search." : "No cards created yet."}
            </p>
          </div>
        ) : (
          /* Cards grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map((card) => {
              const owner = userMap.get(card.id);
              const isLinked = !!owner;
              return (
                <div
                  key={card.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  {/* Banner / color strip */}
                  <div
                    className="h-20 w-full"
                    style={{
                      background: card.bannerImage
                        ? `url(${card.bannerImage}) center/cover`
                        : card.cardTheme?.bannerColor ?? card.cardTheme?.accentColor ?? "#F15928",
                    }}
                  />

                  {/* Avatar */}
                  <div className="relative px-5 pb-5">
                    <div className="-mt-8 mb-3">
                      {card.profileImage ? (
                        <Image
                          src={card.profileImage}
                          alt={card.displayName}
                          width={56}
                          height={56}
                          className="rounded-full border-4 border-gray-950 object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-gray-950 bg-[#F15928]/15 text-lg font-bold text-[#F15928]">
                          {card.displayName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <h3 className="truncate text-sm font-semibold text-white">
                      {card.displayName || "Untitled"}
                    </h3>
                    <p className="truncate text-xs text-gray-400">{card.title || "No title"}</p>

                    {/* Owner badge */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isLinked
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isLinked ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {isLinked ? owner.email : "Unlinked"}
                      </span>
                    </div>

                    {card.slug && (
                      <p className="mt-1.5 truncate text-[10px] text-gray-500">
                        /{card.slug}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href={`/dashboard/edit?uid=${card.id}`}
                        className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-gray-300 transition-all duration-200 hover:bg-white/[0.12] hover:text-white"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => setAssignModal(card)}
                        className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-gray-300 transition-all duration-200 hover:bg-white/[0.12] hover:text-white"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                        Assign
                      </button>
                      <a
                        href={`/card/${card.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-gray-300 transition-all duration-200 hover:bg-white/[0.12] hover:text-white"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        View
                      </a>
                      <button
                        onClick={() => setDeleteConfirm(card.id)}
                        className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400/60 transition-all duration-200 hover:bg-red-500/[0.08] hover:text-red-400"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div
            className="dropdown-enter mx-4 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-gray-900/95 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Delete Card</h3>
            <p className="mt-1 text-sm text-gray-400">
              This will permanently delete this card and its slug. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
              >
                {actionLoading === deleteConfirm ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign modal ── */}
      {assignModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setAssignModal(null); setAssignTarget(""); }}>
          <div
            className="dropdown-enter mx-4 w-full max-w-md rounded-2xl border border-white/[0.08] bg-gray-900/95 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">Assign Card</h3>
            <p className="mt-1 text-sm text-gray-400">
              Transfer <span className="font-medium text-white">{assignModal.displayName}</span>&apos;s card to a registered user.
            </p>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Select User
              </label>
              <select
                value={assignTarget}
                onChange={(e) => setAssignTarget(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#F15928]/40 focus:ring-1 focus:ring-[#F15928]/20"
              >
                <option value="" className="bg-gray-900">Choose a user…</option>
                {users
                  .filter((u) => u.uid !== assignModal.id)
                  .map((u) => (
                    <option key={u.uid} value={u.uid} className="bg-gray-900">
                      {u.name || u.email} ({u.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => { setAssignModal(null); setAssignTarget(""); }}
                className="flex-1 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignTarget || actionLoading === assignModal.id}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F15928] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d94d22] disabled:opacity-50"
              >
                {actionLoading === assignModal.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Assign"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create card modal ── */}
      {createModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCreateModal(false)}>
          <div
            className="dropdown-enter mx-4 w-full max-w-md rounded-2xl border border-white/[0.08] bg-gray-900/95 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">Create New Card</h3>
            <p className="mt-1 text-sm text-gray-400">
              Create a new business card. Optionally assign it to a registered user.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-[#F15928]/40 focus:ring-1 focus:ring-[#F15928]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Title
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-[#F15928]/40 focus:ring-1 focus:ring-[#F15928]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Assign to User (optional)
                </label>
                <select
                  value={createTargetUser}
                  onChange={(e) => setCreateTargetUser(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#F15928]/40 focus:ring-1 focus:ring-[#F15928]/20"
                >
                  <option value="" className="bg-gray-900">No user (unlinked card)</option>
                  {users.map((u) => (
                    <option key={u.uid} value={u.uid} className="bg-gray-900">
                      {u.name || u.email} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setCreateModal(false)}
                className="flex-1 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!createName.trim() || actionLoading === "create"}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F15928] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d94d22] disabled:opacity-50"
              >
                {actionLoading === "create" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
