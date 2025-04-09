
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserHeader } from "@/components/users/UserHeader";
import { UserSearch } from "@/components/users/UserSearch";
import { UserToolbar } from "@/components/users/UserToolbar";
import { UserTable } from "@/components/users/UserTable";
import { UserDialogs } from "@/components/users/UserDialogs";
import { useUserManagement } from "@/hooks/use-user-management";
import { exportUsersToCSV } from "@/utils/users-utils";
import type { Profile } from "@/types/auth";

const Users = () => {
  const [userToEdit, setUserToEdit] = useState<Profile | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const {
    searchQuery,
    userTypeFilter,
    siteFilter,
    phaseFilter,
    stateFilter,
    dateFilter,
    selectedUsers,
    currentPage,
    totalPages,
    sortField,
    sortDirection,
    isLoading,
    users,
    setSearchQuery,
    setUserTypeFilter,
    setSiteFilter,
    setPhaseFilter,
    setStateFilter,
    setDateFilter,
    setCurrentPage,
    handleSort,
    handleSelectAll,
    handleSelectUser,
    handleDeleteSelected,
    handleApplyFilters,
    handleResetFilters
  } = useUserManagement();

  const handleExportUsers = () => {
    const csvContent = exportUsersToCSV(users);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        <UserHeader onCreateUser={() => setIsCreateDialogOpen(true)} />

        <div className="flex flex-col gap-4 mb-6">
          <UserSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userTypeFilter={userTypeFilter}
            onUserTypeFilterChange={setUserTypeFilter}
            onExport={handleExportUsers}
            onApplyFilters={handleApplyFilters}
            siteFilter={siteFilter}
            onSiteFilterChange={setSiteFilter}
            phaseFilter={phaseFilter}
            onPhaseFilterChange={setPhaseFilter}
            stateFilter={stateFilter}
            onStateFilterChange={setStateFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            onReset={handleResetFilters}
          />

          {selectedUsers.length > 0 && (
            <UserToolbar
              selectedCount={selectedUsers.length}
              onExport={handleExportUsers}
              onDelete={() => handleDeleteSelected()}
            />
          )}
        </div>

        <UserTable
          users={users}
          isLoading={isLoading}
          selectedUsers={selectedUsers}
          onSelectAll={handleSelectAll}
          onSelectUser={handleSelectUser}
          onEditUser={(user) => {
            setUserToEdit(user);
            setIsEditDialogOpen(true);
          }}
          onDeleteUser={(userId) => {
            // Here we're passing an array with a single ID
            const idsToDelete = [userId];
            handleDeleteSelected(idsToDelete);
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />

        <div className="mt-8 text-center text-xs text-gray-500">
          © 2025 NADI. All rights reserved.
        </div>
      </div>

      <UserDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        userToEdit={userToEdit}
        setUserToEdit={setUserToEdit}
      />
    </DashboardLayout>
  );
};

export default Users;
