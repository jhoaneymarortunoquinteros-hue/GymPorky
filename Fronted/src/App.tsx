import React, { useState } from 'react';
import { ScreenView, Member, Equipment, TrainingLogEntry, SystemRole } from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_EQUIPMENT,
  INITIAL_TRAINING_LOGS,
  INITIAL_ROLES,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { ScreenSwitcher } from './components/ScreenSwitcher';
import { LoginScreen } from './components/LoginScreen';
import { MembersScreen } from './components/MembersScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { TrainingLogScreen } from './components/TrainingLogScreen';
import { AccessControlScreen } from './components/AccessControlScreen';
import { DashboardScreen } from './components/DashboardScreen';

export default function App() {
  // Navigation State - defaults to members roster or dashboard
  const [currentView, setCurrentView] = useState<ScreenView>('members');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Application Data States
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLogEntry[]>(INITIAL_TRAINING_LOGS);
  const [roles, setRoles] = useState<SystemRole[]>(INITIAL_ROLES);
  const [currentOccupancy, setCurrentOccupancy] = useState<number>(42);

  // Global Trigger for Add Member Modal
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Handlers for Members
  const handleAddMember = (newMemberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...newMemberData,
      id: `mem-${Date.now()}`,
    };
    setMembers([newMember, ...members]);
  };

  const handleUpdateMember = (id: string, updates: Partial<Member>) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  // Handlers for Equipment
  const handleAddEquipment = (newEquipmentData: Omit<Equipment, 'id'>) => {
    const newEquip: Equipment = {
      ...newEquipmentData,
      id: `eq-${Date.now()}`,
    };
    setEquipmentList([newEquip, ...equipmentList]);
  };

  const handleUpdateEquipment = (id: string, updates: Partial<Equipment>) => {
    setEquipmentList(equipmentList.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipmentList(equipmentList.filter((e) => e.id !== id));
  };

  // Handlers for Training Logs
  const handleAddLogEntry = (newEntryData: Omit<TrainingLogEntry, 'id'>) => {
    const newLog: TrainingLogEntry = {
      ...newEntryData,
      id: `log-${Date.now()}`,
    };
    setTrainingLogs([newLog, ...trainingLogs]);
    setCurrentOccupancy((prev) => Math.min(150, prev + 1));
  };

  // Handlers for Roles
  const handleAddRole = (newRoleData: Omit<SystemRole, 'id'>) => {
    const newRole: SystemRole = {
      ...newRoleData,
      id: `role-${Date.now()}`,
    };
    setRoles([...roles, newRole]);
  };

  const handleUpdateRole = (id: string, updates: Partial<SystemRole>) => {
    setRoles(roles.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  const handleLogout = () => {
    setCurrentView('login');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('members');
  };

  // Render Login view directly without sidebar when in login view
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-[#111111] text-[#e5e2e1] font-inter">
        <ScreenSwitcher
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view);
            if (view !== 'login') setIsAuthenticated(true);
          }}
        />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#e5e2e1] font-inter flex flex-col selection:bg-[#E2FF00] selection:text-[#111111]">
      {/* Universal Screen Switcher preview bar for rapid switching between screens */}
      <ScreenSwitcher
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
      />

      <div className="flex flex-1 relative">
        {/* Desktop Brutalist Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onAddMemberClick={() => {
            setCurrentView('members');
            setIsAddMemberModalOpen(true);
          }}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
          {/* Mobile Header Navigation */}
          <MobileNav
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            onAddMemberClick={() => {
              setCurrentView('members');
              setIsAddMemberModalOpen(true);
            }}
            onLogout={handleLogout}
          />

          {/* Main Dynamic View Screen with generous padding */}
          <main className="flex-1 p-5 sm:p-8 md:p-12 pb-24 md:pb-16 overflow-y-auto">
            {currentView === 'dashboard' && (
              <DashboardScreen
                onNavigate={(view) => setCurrentView(view)}
                members={members}
                equipmentList={equipmentList}
                trainingLogs={trainingLogs}
                onOpenAddMember={() => {
                  setCurrentView('members');
                  setIsAddMemberModalOpen(true);
                }}
              />
            )}

            {currentView === 'members' && (
              <MembersScreen
                members={members}
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
                isAddModalOpen={isAddMemberModalOpen}
                onCloseAddModal={() => setIsAddMemberModalOpen(false)}
              />
            )}

            {currentView === 'inventory' && (
              <InventoryScreen
                equipmentList={equipmentList}
                onAddEquipment={handleAddEquipment}
                onUpdateEquipment={handleUpdateEquipment}
                onDeleteEquipment={handleDeleteEquipment}
              />
            )}

            {currentView === 'training_log' && (
              <TrainingLogScreen
                logs={trainingLogs}
                onAddLogEntry={handleAddLogEntry}
                currentOccupancy={currentOccupancy}
              />
            )}

            {currentView === 'access_control' && (
              <AccessControlScreen
                roles={roles}
                onAddRole={handleAddRole}
                onUpdateRole={handleUpdateRole}
                onDeleteRole={handleDeleteRole}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

