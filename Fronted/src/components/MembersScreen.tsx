import React, { useState, useMemo } from 'react';
import { Member, MemberStatus, MemberPlan } from '../types';

interface MembersScreenProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const MembersScreen: React.FC<MembersScreenProps> = ({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  isAddModalOpen: externalAddModalOpen,
  onCloseAddModal: externalCloseAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | MemberStatus>('all');
  const [selectedMemberStats, setSelectedMemberStats] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [localAddModalOpen, setLocalAddModalOpen] = useState(false);

  const showAddModal = externalAddModalOpen || localAddModalOpen;
  const handleCloseAddModal = () => {
    setLocalAddModalOpen(false);
    if (externalCloseAddModal) externalCloseAddModal();
  };

  // Form State for new member
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Pro Tier' as MemberPlan,
    status: 'active' as MemberStatus,
    avatarUrl: '',
    bench1RM: '225 lbs',
    deadlift1RM: '315 lbs',
    squat1RM: '275 lbs',
  });

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const total = 1248 + members.length - 6; // Base display count scaled with dynamic additions
    const active = members.filter((m) => m.status === 'active').length + 979;
    const expired = members.filter((m) => m.status === 'expired').length + 155;
    const pending = members.filter((m) => m.status === 'pending').length + 108;
    return { total, active, expired, pending };
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.codeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.plan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedFilter === 'all' ? true : member.status === selectedFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, selectedFilter]);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name.trim()) return;

    const randomIdNum = Math.floor(1000 + Math.random() * 9000);
    onAddMember({
      codeId: `#IT-${randomIdNum}`,
      name: newMemberForm.name,
      email: newMemberForm.email || `${newMemberForm.name.toLowerCase().replace(/\s+/g, '.')}@pulse.io`,
      phone: newMemberForm.phone || '+1 (555) 000-0000',
      plan: newMemberForm.plan,
      status: newMemberForm.status,
      renewDate: newMemberForm.status === 'active' ? 'Nov 30' : 'Pending',
      avatarUrl: newMemberForm.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      actionReqd: newMemberForm.status === 'pending' ? 'Waiver Sign' : undefined,
      stats: {
        bench1RM: newMemberForm.bench1RM,
        deadlift1RM: newMemberForm.deadlift1RM,
        squat1RM: newMemberForm.squat1RM,
        weeklyVisits: 4,
        memberSince: 'Today',
        activeStreakDays: 1,
      },
    });

    setNewMemberForm({
      name: '',
      email: '',
      phone: '',
      plan: 'Pro Tier',
      status: 'active',
      avatarUrl: '',
      bench1RM: '225 lbs',
      deadlift1RM: '315 lbs',
      squat1RM: '275 lbs',
    });
    handleCloseAddModal();
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember.id, editingMember);
    setEditingMember(null);
  };

  const handleRenewMember = (member: Member) => {
    onUpdateMember(member.id, {
      status: 'active',
      renewDate: 'Nov 15',
      expiredDate: undefined,
    });
  };

  const handleApprovePending = (member: Member) => {
    onUpdateMember(member.id, {
      status: 'active',
      actionReqd: undefined,
      renewDate: 'Nov 15',
    });
  };

  const handleDenyPending = (member: Member) => {
    onDeleteMember(member.id);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#F5F5F5]/20 pb-6">
        <div>
          <h2 className="font-bebas text-4xl md:text-5xl uppercase text-white m-0 flex items-center gap-3 tracking-wider">
            <span className="w-2 h-10 bg-[#E2FF00] inline-block"></span>
            MEMBERS ROSTER
          </h2>
          <p className="font-montserrat text-sm text-[#c6c9ab] mt-2 font-medium">
            Manage active subscriptions and member profiles.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6c9ab]">
              search
            </span>
            <input
              id="members-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              type="text"
              className="w-full bg-transparent border-0 border-b border-[#F5F5F5]/20 text-white pl-10 pr-3 py-2 focus:ring-0 focus:border-[#E2FF00] font-inter text-sm outline-none transition-colors placeholder:text-[#c6c9ab]/60"
            />
          </div>
          <button
            id="register-member-top-btn"
            onClick={() => setLocalAddModalOpen(true)}
            className="bg-[#E2FF00] text-[#111111] font-montserrat font-bold text-xs px-6 py-3 uppercase flex items-center gap-2 hover:bg-white transition-colors shrink-0 rounded-none cursor-pointer tracking-wider shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            REGISTER MEMBER
          </button>
        </div>
      </div>

      {/* Metric Cards Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-[#F5F5F5]/10 pb-8">
        {/* Total Members */}
        <div
          onClick={() => setSelectedFilter('all')}
          className={`bg-[#131313] p-6 border transition-all cursor-pointer flex flex-col gap-1 ${
            selectedFilter === 'all'
              ? 'border-b-2 border-b-[#E2FF00] border-white/20'
              : 'border-[#F5F5F5]/20 hover:border-[#E2FF00]'
          }`}
        >
          <span className="font-montserrat text-xs font-bold text-[#c6c9ab] uppercase tracking-wider">
            Total Members
          </span>
          <span className="font-bebas text-3xl md:text-4xl text-white tracking-wider">
            {stats.total.toLocaleString()}
          </span>
        </div>

        {/* Active */}
        <div
          onClick={() => setSelectedFilter('active')}
          className={`bg-[#131313] p-6 border transition-all cursor-pointer flex flex-col gap-1 ${
            selectedFilter === 'active'
              ? 'border-b-2 border-b-[#E2FF00] border-white/20'
              : 'border-[#F5F5F5]/20 hover:border-[#E2FF00]'
          }`}
        >
          <span className="font-montserrat text-xs font-bold text-[#E2FF00] uppercase tracking-wider">
            Active
          </span>
          <span className="font-bebas text-3xl md:text-4xl text-white tracking-wider">
            {stats.active.toLocaleString()}
          </span>
        </div>

        {/* Expired */}
        <div
          onClick={() => setSelectedFilter('expired')}
          className={`bg-[#131313] p-6 border transition-all cursor-pointer flex flex-col gap-1 ${
            selectedFilter === 'expired'
              ? 'border-b-2 border-b-[#ffb4ab] border-white/20'
              : 'border-[#F5F5F5]/20 hover:border-[#ffb4ab]'
          }`}
        >
          <span className="font-montserrat text-xs font-bold text-[#c6c9ab] uppercase tracking-wider">
            Expired
          </span>
          <span className="font-bebas text-3xl md:text-4xl text-[#ffb4ab] tracking-wider">
            {stats.expired.toLocaleString()}
          </span>
        </div>

        {/* Pending */}
        <div
          onClick={() => setSelectedFilter('pending')}
          className={`bg-[#131313] p-6 border transition-all cursor-pointer flex flex-col gap-1 ${
            selectedFilter === 'pending'
              ? 'border-b-2 border-b-white border-white/20'
              : 'border-[#F5F5F5]/20 hover:border-white'
          }`}
        >
          <span className="font-montserrat text-xs font-bold text-[#c6c9ab] uppercase tracking-wider">
            Pending
          </span>
          <span className="font-bebas text-3xl md:text-4xl text-white tracking-wider">
            {stats.pending.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const isActive = member.status === 'active';
          const isExpired = member.status === 'expired';
          const isPending = member.status === 'pending';

          return (
            <div
              key={member.id}
              className="relative bg-[#131313] border border-[#F5F5F5]/20 overflow-hidden group transition-all duration-300"
            >
              {/* Image Banner */}
              <div className="h-48 w-full relative bg-[#201f1f] overflow-hidden">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      isActive
                        ? 'grayscale group-hover:grayscale-0'
                        : isExpired
                        ? 'grayscale opacity-70'
                        : 'grayscale'
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-[#c6c9ab] opacity-20">
                      person
                    </span>
                  </div>
                )}

                {/* Status Badges on Top Right */}
                {isActive && (
                  <div className="absolute top-4 right-4 bg-[#111111] border border-[#E2FF00] text-[#E2FF00] font-montserrat text-[11px] font-bold px-2.5 py-1 uppercase flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#E2FF00] animate-pulse"></span>
                    ACTIVE
                  </div>
                )}

                {isExpired && (
                  <div className="absolute top-4 right-4 bg-[#ffb4ab] text-[#111111] font-montserrat text-[11px] font-bold px-2.5 py-1 uppercase flex items-center gap-1">
                    EXPIRED
                  </div>
                )}

                {isPending && (
                  <div className="absolute top-4 right-4 bg-[#111111] border border-white/50 text-white font-montserrat text-[11px] font-bold px-2.5 py-1 uppercase flex items-center gap-1">
                    PENDING
                  </div>
                )}

                {isExpired && (
                  <div className="absolute inset-0 bg-[#93000a]/10 mix-blend-overlay pointer-events-none"></div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3
                  className={`font-montserrat font-semibold text-lg text-white m-0 uppercase tracking-wide ${
                    isExpired ? 'opacity-70' : ''
                  }`}
                >
                  {member.name}
                </h3>
                <p className="font-inter text-xs text-[#c6c9ab] mt-1">
                  ID: {member.codeId}
                </p>

                {/* Plan Details & Renewal */}
                <div
                  className={`flex items-center justify-between gap-4 mt-4 pt-4 border-t border-[#F5F5F5]/10 ${
                    isExpired ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-montserrat text-[10px] font-bold text-[#c6c9ab] uppercase tracking-wider">
                      Plan
                    </span>
                    <span className="font-montserrat font-semibold text-sm text-white">
                      {member.plan}
                    </span>
                  </div>

                  {isActive && (
                    <div className="flex flex-col text-right">
                      <span className="font-montserrat text-[10px] font-bold text-[#c6c9ab] uppercase tracking-wider">
                        Renews
                      </span>
                      <span className="font-montserrat font-semibold text-sm text-white">
                        {member.renewDate}
                      </span>
                    </div>
                  )}

                  {isExpired && (
                    <div className="flex flex-col text-right">
                      <span className="font-montserrat text-[10px] font-bold text-[#ffb4ab] uppercase tracking-wider">
                        Expired On
                      </span>
                      <span className="font-montserrat font-semibold text-sm text-[#ffb4ab]">
                        {member.expiredDate || 'Sep 01'}
                      </span>
                    </div>
                  )}

                  {isPending && (
                    <div className="flex flex-col text-right">
                      <span className="font-montserrat text-[10px] font-bold text-[#c6c9ab] uppercase tracking-wider">
                        Action Reqd
                      </span>
                      <span className="font-montserrat font-semibold text-sm text-white">
                        {member.actionReqd || 'Waiver Sign'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Action Overlay */}
              <div className="absolute inset-0 bg-[#111111]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center gap-3 p-6 backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto">
                {isActive && (
                  <>
                    <button
                      onClick={() => setSelectedMemberStats(member)}
                      className="w-full bg-[#E2FF00] text-[#111111] font-montserrat font-bold text-xs py-2.5 uppercase flex justify-center items-center gap-2 hover:bg-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">query_stats</span>
                      View Stats
                    </button>
                    <button
                      onClick={() => setEditingMember(member)}
                      className="w-full border border-[#F5F5F5]/20 text-white font-montserrat font-bold text-xs py-2.5 uppercase flex justify-center items-center gap-2 hover:border-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Edit Profile
                    </button>
                  </>
                )}

                {isExpired && (
                  <>
                    <button
                      onClick={() => handleRenewMember(member)}
                      className="w-full bg-white text-[#111111] font-montserrat font-bold text-xs py-2.5 uppercase flex justify-center items-center gap-2 hover:bg-[#E2FF00] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">autorenew</span>
                      Renew Plan
                    </button>
                    <button
                      onClick={() => setEditingMember(member)}
                      className="w-full border border-[#F5F5F5]/20 text-white font-montserrat font-bold text-xs py-2.5 uppercase flex justify-center items-center gap-2 hover:border-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Edit Profile
                    </button>
                  </>
                )}

                {isPending && (
                  <>
                    <button
                      onClick={() => handleApprovePending(member)}
                      className="w-full bg-[#E2FF00] text-[#111111] font-montserrat font-bold text-xs py-2.5 uppercase flex justify-center items-center gap-2 hover:bg-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      Approve
                    </button>
                    <button
                      onClick={() => handleDenyPending(member)}
                      className="w-full border border-[#F5F5F5]/20 text-white font-montserrat font-bold text-xs py-2.5 uppercase flex justify-center items-center gap-2 hover:border-[#ffb4ab] transition-colors hover:text-[#ffb4ab] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                      Deny
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="p-12 border border-white/10 bg-[#131313] text-center">
          <p className="font-bebas text-2xl text-white">NO MEMBERS FOUND</p>
          <p className="font-inter text-sm text-[#c6c9ab] mt-1">
            Try adjusting your search criteria or register a new member profile.
          </p>
        </div>
      )}

      {/* Register Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131313] border-2 border-[#E2FF00] w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseAddModal}
              className="absolute top-4 right-4 text-[#c6c6c7] hover:text-white font-mono text-xl"
            >
              ✕
            </button>
            <h3 className="font-bebas text-3xl text-[#E2FF00] tracking-wider mb-1">
              REGISTER NEW ATHLETE
            </h3>
            <p className="font-inter text-xs text-[#c6c9ab] mb-6">
              Create an official IronTrack credential profile.
            </p>

            <form onSubmit={handleCreateMember} className="flex flex-col gap-4">
              <div>
                <label className="font-montserrat text-xs text-[#c6c6c7] uppercase font-bold block mb-1">
                  Athlete Name *
                </label>
                <input
                  required
                  type="text"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="e.g. Marcus Thorne"
                  className="w-full bg-[#201f1f] border border-white/20 p-2.5 text-white font-inter text-sm focus:border-[#E2FF00] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-montserrat text-xs text-[#c6c6c7] uppercase font-bold block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    placeholder="athlete@pulse.io"
                    className="w-full bg-[#201f1f] border border-white/20 p-2.5 text-white font-inter text-sm focus:border-[#E2FF00] outline-none"
                  />
                </div>
                <div>
                  <label className="font-montserrat text-xs text-[#c6c6c7] uppercase font-bold block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#201f1f] border border-white/20 p-2.5 text-white font-inter text-sm focus:border-[#E2FF00] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-montserrat text-xs text-[#c6c6c7] uppercase font-bold block mb-1">
                    Subscription Tier
                  </label>
                  <select
                    value={newMemberForm.plan}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, plan: e.target.value as MemberPlan })}
                    className="w-full bg-[#201f1f] border border-white/20 p-2.5 text-white font-inter text-sm focus:border-[#E2FF00] outline-none"
                  >
                    <option value="Pro Tier">Pro Tier ($189/mo)</option>
                    <option value="Base Tier">Base Tier ($119/mo)</option>
                    <option value="VIP Black">VIP Black ($299/mo)</option>
                    <option value="Elite All-Access">Elite All-Access ($399/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="font-montserrat text-xs text-[#c6c6c7] uppercase font-bold block mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newMemberForm.status}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, status: e.target.value as MemberStatus })}
                    className="w-full bg-[#201f1f] border border-white/20 p-2.5 text-white font-inter text-sm focus:border-[#E2FF00] outline-none"
                  >
                    <option value="active">Active (Immediate Check-in)</option>
                    <option value="pending">Pending Waiver / Onboarding</option>
                  </select>
                </div>
              </div>

              {/* Baseline Lifting Stats */}
              <div className="border-t border-white/10 pt-4">
                <p className="font-montserrat text-xs font-bold text-[#E2FF00] uppercase mb-2">
                  Baseline 1RM Benchmark Records
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="font-inter text-[11px] text-[#c6c9ab]">Bench Press</span>
                    <input
                      type="text"
                      value={newMemberForm.bench1RM}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, bench1RM: e.target.value })}
                      className="w-full bg-[#201f1f] border border-white/20 p-1.5 text-white text-xs mt-1"
                    />
                  </div>
                  <div>
                    <span className="font-inter text-[11px] text-[#c6c9ab]">Deadlift</span>
                    <input
                      type="text"
                      value={newMemberForm.deadlift1RM}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, deadlift1RM: e.target.value })}
                      className="w-full bg-[#201f1f] border border-white/20 p-1.5 text-white text-xs mt-1"
                    />
                  </div>
                  <div>
                    <span className="font-inter text-[11px] text-[#c6c9ab]">Back Squat</span>
                    <input
                      type="text"
                      value={newMemberForm.squat1RM}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, squat1RM: e.target.value })}
                      className="w-full bg-[#201f1f] border border-white/20 p-1.5 text-white text-xs mt-1"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full bg-[#E2FF00] text-[#111111] font-bebas text-2xl py-3 uppercase hover:bg-white transition-colors cursor-pointer"
              >
                ISSUE ATHLETE CREDENTIAL
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Stats Modal */}
      {selectedMemberStats && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131313] border border-[#E2FF00] w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedMemberStats(null)}
              className="absolute top-4 right-4 text-[#c6c6c7] hover:text-white font-mono text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#201f1f] border border-[#E2FF00] overflow-hidden">
                {selectedMemberStats.avatarUrl ? (
                  <img
                    src={selectedMemberStats.avatarUrl}
                    alt={selectedMemberStats.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-[#c6c9ab]">person</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bebas text-3xl text-white tracking-wider leading-none">
                  {selectedMemberStats.name}
                </h3>
                <p className="font-montserrat text-xs text-[#E2FF00] font-bold uppercase mt-1">
                  {selectedMemberStats.codeId} • {selectedMemberStats.plan}
                </p>
                <p className="font-inter text-xs text-[#c6c9ab]">
                  Member Since: {selectedMemberStats.stats?.memberSince || '2023'}
                </p>
              </div>
            </div>

            {/* Benchmark Records */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#201f1f] p-4 border border-white/10 text-center">
                <span className="font-montserrat text-[10px] font-bold text-[#c6c9ab] uppercase block">
                  Bench 1RM
                </span>
                <span className="font-bebas text-2xl text-white">
                  {selectedMemberStats.stats?.bench1RM || '315 lbs'}
                </span>
              </div>
              <div className="bg-[#201f1f] p-4 border border-white/10 text-center">
                <span className="font-montserrat text-[10px] font-bold text-[#c6c9ab] uppercase block">
                  Deadlift 1RM
                </span>
                <span className="font-bebas text-2xl text-[#E2FF00]">
                  {selectedMemberStats.stats?.deadlift1RM || '495 lbs'}
                </span>
              </div>
              <div className="bg-[#201f1f] p-4 border border-white/10 text-center">
                <span className="font-montserrat text-[10px] font-bold text-[#c6c9ab] uppercase block">
                  Squat 1RM
                </span>
                <span className="font-bebas text-2xl text-white">
                  {selectedMemberStats.stats?.squat1RM || '405 lbs'}
                </span>
              </div>
            </div>

            {/* Attendance & Streak Metrics */}
            <div className="bg-[#1c1b1b] p-4 border border-white/10 mb-6 flex justify-around text-center">
              <div>
                <span className="font-montserrat text-[10px] font-bold text-[#c6c9ab] uppercase block">
                  Weekly Avg Visits
                </span>
                <span className="font-bebas text-2xl text-white">
                  {selectedMemberStats.stats?.weeklyVisits || 5} Days / Wk
                </span>
              </div>
              <div className="border-r border-white/10"></div>
              <div>
                <span className="font-montserrat text-[10px] font-bold text-[#c6c9ab] uppercase block">
                  Active Streak
                </span>
                <span className="font-bebas text-2xl text-[#E2FF00]">
                  {selectedMemberStats.stats?.activeStreakDays || 18} Days
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMemberStats(null)}
              className="w-full bg-[#E2FF00] text-[#111111] font-bebas text-2xl py-2.5 uppercase hover:bg-white transition-colors"
            >
              CLOSE RECORD
            </button>
          </div>
        </div>
      )}

      {/* Edit Member Profile Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131313] border border-white/20 w-full max-w-md p-6 relative">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-4 right-4 text-[#c6c6c7] hover:text-white font-mono text-xl"
            >
              ✕
            </button>
            <h3 className="font-bebas text-3xl text-white tracking-wider mb-4">
              EDIT ATHLETE PROFILE
            </h3>

            <form onSubmit={handleEditSave} className="flex flex-col gap-4">
              <div>
                <label className="font-montserrat text-xs text-[#c6c6c7] uppercase font-bold block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-[#201f1f] border border-white/20 p-2.5 text-white font-inter text-sm focus:border-[#E2FF00] outline-none"
                />
              </div>

              <div>
                <label className="font-montserrat text-xs text-[#c6c6c7] uppercase font-bold block mb-1">
                  Subscription Tier
                </label>
                <select
                  value={editingMember.plan}
                  onChange={(e) => setEditingMember({ ...editingMember, plan: e.target.value as MemberPlan })}
                  className="w-full bg-[#201f1f] border border-white/20 p-2.5 text-white font-inter text-sm focus:border-[#E2FF00] outline-none"
                >
                  <option value="Pro Tier">Pro Tier</option>
                  <option value="Base Tier">Base Tier</option>
                  <option value="VIP Black">VIP Black</option>
                  <option value="Elite All-Access">Elite All-Access</option>
                </select>
              </div>

              <div>
                <label className="font-montserrat text-xs text-[#c6c6c7] uppercase font-bold block mb-1">
                  Status
                </label>
                <select
                  value={editingMember.status}
                  onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as MemberStatus })}
                  className="w-full bg-[#201f1f] border border-white/20 p-2.5 text-white font-inter text-sm focus:border-[#E2FF00] outline-none"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteMember(editingMember.id);
                    setEditingMember(null);
                  }}
                  className="flex-1 border border-[#ffb4ab] text-[#ffb4ab] font-montserrat font-bold text-xs py-3 uppercase hover:bg-[#ffb4ab] hover:text-[#111111] transition-colors"
                >
                  Delete Member
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#E2FF00] text-[#111111] font-montserrat font-bold text-xs py-3 uppercase hover:bg-white transition-colors"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
