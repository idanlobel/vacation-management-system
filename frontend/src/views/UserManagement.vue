<template>
  <div class="user-management">
    <div class="container">
      <!-- Header Section -->
      <div class="management-header">
        <div class="header-content">
          <h1 class="management-title">User Management</h1>
          <p class="management-description">
            Add new employees and managers to the vacation management system.
          </p>
        </div>
      </div>

      <!-- Alerts -->
      <Alert
        v-if="alert.show"
        :type="alert.type"
        :title="alert.title"
        :message="alert.message"
        :auto-hide="true"
        @dismiss="alert.show = false"
      />

      <!-- Add New User Section -->
      <div class="add-user-section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Add New User</h2>
            <p class="card-description">
              Create a new employee or manager account
            </p>
          </div>
          
          <UserForm
            @user-created="handleUserCreated"
            @creation-error="handleCreationError"
            :loading="loading"
          />
        </div>
      </div>

      <!-- Users List Section -->
      <div class="users-list-section">
        <div class="card">
          <div class="card-header">
            <div class="users-header">
              <div>
                <h2 class="card-title">All Users</h2>
                <p class="card-description">
                  Manage existing employees and managers
                </p>
              </div>
              <button 
                @click="fetchUsers" 
                class="btn btn-outline"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner"></span>
                Refresh
              </button>
            </div>
          </div>

          <!-- Users Statistics -->
          <div v-if="users.length > 0" class="users-stats">
            <div class="stat-item">
              <div class="stat-value">{{ getUsersCountByRole('requester') }}</div>
              <div class="stat-label">Employees</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ getUsersCountByRole('validator') }}</div>
              <div class="stat-label">Managers</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ users.length }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>
          
          <UsersList
            :users="users"
            :loading="loading"
            @edit-user="handleEditUser"
            @delete-user="handleDeleteUser"
          />
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <EditUserModal
      v-if="showEditModal"
      :user="selectedUser"
      @user-updated="handleUserUpdated"
      @update-error="handleUpdateError"
      @cancel="cancelEdit"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-if="showDeleteModal"
      title="Delete User"
      :message="`Are you sure you want to delete ${userToDelete?.name}? This will also delete all their vacation requests. This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { usersAPI } from '@/services/api'
import { handleApiError } from '@/utils/helpers'
import UserForm from '@/components/UserForm.vue'
import UsersList from '@/components/UsersList.vue'
import EditUserModal from '@/components/EditUserModal.vue'
import Alert from '@/components/Alert.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

export default {
  name: 'UserManagement',
  components: {
    UserForm,
    UsersList,
    EditUserModal,
    Alert,
    ConfirmationModal
  },
  data() {
    return {
      users: [],
      loading: false,
      alert: {
        show: false,
        type: 'info',
        title: '',
        message: ''
      },
      showEditModal: false,
      selectedUser: null,
      showDeleteModal: false,
      userToDelete: null
    }
  },
  async mounted() {
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const response = await usersAPI.getAll()
        this.users = response.data || []
      } catch (error) {
        console.error('Error fetching users:', error)
        this.showAlert('error', 'Error', 'Failed to load users')
        this.users = []
      } finally {
        this.loading = false
      }
    },

    handleUserCreated(newUser) {
      this.showAlert('success', 'Success!', `User ${newUser.name} has been created successfully.`)
      this.users.unshift(newUser)
    },

    handleCreationError(error) {
      const errorMessage = handleApiError(error)
      this.showAlert('error', 'Creation Failed', errorMessage)
    },

    handleEditUser(user) {
      this.selectedUser = { ...user }
      this.showEditModal = true
    },

    handleUserUpdated(updatedUser) {
      this.showAlert('success', 'Updated', `User ${updatedUser.name} has been updated successfully.`)
      
      // Update user in local array
      const index = this.users.findIndex(u => u.id === updatedUser.id)
      if (index !== -1) {
        this.users[index] = updatedUser
      }
      
      this.cancelEdit()
    },

    handleUpdateError(error) {
      const errorMessage = handleApiError(error)
      this.showAlert('error', 'Update Failed', errorMessage)
    },

    cancelEdit() {
      this.showEditModal = false
      this.selectedUser = null
    },

    handleDeleteUser(user) {
      this.userToDelete = user
      this.showDeleteModal = true
    },

    async confirmDelete() {
      if (!this.userToDelete) return

      try {
        await usersAPI.delete(this.userToDelete.id)
        
        // Remove from local users array
        this.users = this.users.filter(u => u.id !== this.userToDelete.id)
        
        this.showAlert('success', 'Deleted', `User ${this.userToDelete.name} has been deleted successfully.`)
      } catch (error) {
        console.error('Error deleting user:', error)
        const errorMessage = handleApiError(error)
        this.showAlert('error', 'Delete Failed', errorMessage)
      } finally {
        this.cancelDelete()
      }
    },

    cancelDelete() {
      this.showDeleteModal = false
      this.userToDelete = null
    },

    getUsersCountByRole(role) {
      return this.users.filter(user => user.role === role).length
    },

    showAlert(type, title, message) {
      this.alert = {
        show: true,
        type,
        title,
        message
      }
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 0;
}

.management-header {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 3rem 0;
}

.header-content {
  text-align: center;
}

.management-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.management-description {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.add-user-section,
.users-list-section {
  padding: 2rem 0;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.users-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: var(--background-color);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--card-background);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .management-title {
    font-size: 2rem;
  }

  .management-description {
    font-size: 1rem;
  }

  .users-header {
    flex-direction: column;
    align-items: stretch;
  }

  .users-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>