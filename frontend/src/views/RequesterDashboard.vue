<template>
  <div class="requester-dashboard">
    <div class="container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="dashboard-title">My Vacation Requests</h1>
          <p class="dashboard-description">
            Submit new vacation requests and track the status of your existing requests.
          </p>
        </div>
      </div>

      <!-- User Selection (if no userId prop) -->
      <div v-if="!userId" class="user-selection-section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Select Your Profile</h2>
            <p class="card-description">Choose your user profile to continue</p>
          </div>
          <UserSelector
            v-model="selectedUserId"
            role="requester"
            label="Select Employee"
            placeholder="Choose your profile..."
            @user-selected="handleUserSelected"
          />
        </div>
      </div>

      <!-- Main Dashboard (when user is selected) -->
      <div v-if="currentUser" class="dashboard-content">
        <!-- User Info Card -->
        <div class="user-info-card card">
          <div class="user-info-content">
            <div class="user-avatar-large">
              {{ currentUser.name.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info-details">
              <h2>{{ currentUser.name }}</h2>
              <p>{{ currentUser.email }}</p>
              <span class="badge badge-pending">Employee</span>
            </div>
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

        <!-- Submit New Request Section -->
        <div class="submit-request-section">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Submit New Vacation Request</h2>
              <p class="card-description">
                Fill out the form below to submit a new vacation request
              </p>
            </div>
            
            <VacationRequestForm
              :user-id="currentUser.id"
              @request-submitted="handleRequestSubmitted"
              @submission-error="handleSubmissionError"
            />
          </div>
        </div>

        <!-- My Requests Section -->
        <div class="my-requests-section">
          <div class="card">
            <div class="card-header">
              <div class="requests-header">
                <div>
                  <h2 class="card-title">My Vacation Requests</h2>
                  <p class="card-description">
                    View and manage your vacation request history
                  </p>
                </div>
                <button 
                  @click="fetchRequests" 
                  class="btn btn-outline"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner"></span>
                  Refresh
                </button>
              </div>
            </div>

            <!-- Requests Statistics -->
            <div v-if="requests.length > 0" class="requests-stats">
              <div class="stat-item">
                <div class="stat-value">{{ getRequestsCountByStatus('pending') }}</div>
                <div class="stat-label">Pending</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getRequestsCountByStatus('approved') }}</div>
                <div class="stat-label">Approved</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getRequestsCountByStatus('rejected') }}</div>
                <div class="stat-label">Rejected</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ requests.length }}</div>
                <div class="stat-label">Total</div>
              </div>
            </div>
            
            <VacationRequestsList
              :requests="requests"
              :loading="loading"
              user-role="requester"
              :empty-message="'You have not submitted any vacation requests yet.'"
              @delete-request="handleDeleteRequest"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-if="showDeleteModal"
      title="Delete Vacation Request"
      :message="`Are you sure you want to delete this vacation request for ${formatDate(requestToDelete?.start_date)} to ${formatDate(requestToDelete?.end_date)}? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { vacationRequestsAPI, usersAPI } from '@/services/api'
import { formatDate, handleApiError } from '@/utils/helpers'
import UserSelector from '@/components/UserSelector.vue'
import VacationRequestForm from '@/components/VacationRequestForm.vue'
import VacationRequestsList from '@/components/VacationRequestsList.vue'
import Alert from '@/components/Alert.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

export default {
  name: 'RequesterDashboard',
  components: {
    UserSelector,
    VacationRequestForm,
    VacationRequestsList,
    Alert,
    ConfirmationModal
  },
  props: {
    userId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      selectedUserId: this.userId,
      currentUser: null,
      requests: [],
      loading: false,
      alert: {
        show: false,
        type: 'info',
        title: '',
        message: ''
      },
      showDeleteModal: false,
      requestToDelete: null
    }
  },
  async mounted() {
    if (this.userId) {
      this.selectedUserId = this.userId
      await this.loadUserData()
    }
  },
  watch: {
    userId(newUserId) {
      if (newUserId) {
        this.selectedUserId = newUserId
        this.loadUserData()
      }
    }
  },
  methods: {
    async handleUserSelected(user) {
      this.currentUser = user
      if (user) {
        await this.fetchRequests()
      } else {
        this.requests = []
      }
    },

    async loadUserData() {
      if (!this.selectedUserId) return

      try {
        const userResponse = await usersAPI.getById(this.selectedUserId)
        this.currentUser = userResponse.data
        await this.fetchRequests()
      } catch (error) {
        console.error('Error loading user data:', error)
        this.showAlert('error', 'Error', 'Failed to load user data')
      }
    },

    async fetchRequests() {
      if (!this.currentUser) return

      this.loading = true
      try {
        const response = await vacationRequestsAPI.getByUserId(this.currentUser.id)
        this.requests = response.data || []
      } catch (error) {
        console.error('Error fetching requests:', error)
        this.showAlert('error', 'Error', 'Failed to load vacation requests')
        this.requests = []
      } finally {
        this.loading = false
      }
    },

    handleRequestSubmitted(newRequest) {
      this.showAlert('success', 'Success!', 'Your vacation request has been submitted successfully.')
      this.requests.unshift(newRequest)
    },

    handleSubmissionError(error) {
      const errorMessage = handleApiError(error)
      this.showAlert('error', 'Submission Failed', errorMessage)
    },

    handleDeleteRequest(request) {
      this.requestToDelete = request
      this.showDeleteModal = true
    },

    async confirmDelete() {
      if (!this.requestToDelete) return

      try {
        await vacationRequestsAPI.delete(this.requestToDelete.id)
        
        // Remove from local requests array
        this.requests = this.requests.filter(r => r.id !== this.requestToDelete.id)
        
        this.showAlert('success', 'Deleted', 'Vacation request deleted successfully.')
      } catch (error) {
        console.error('Error deleting request:', error)
        const errorMessage = handleApiError(error)
        this.showAlert('error', 'Delete Failed', errorMessage)
      } finally {
        this.cancelDelete()
      }
    },

    cancelDelete() {
      this.showDeleteModal = false
      this.requestToDelete = null
    },

    getRequestsCountByStatus(status) {
      return this.requests.filter(request => request.status === status).length
    },

    showAlert(type, title, message) {
      this.alert = {
        show: true,
        type,
        title,
        message
      }
    },

    formatDate
  }
}
</script>

<style scoped>
.requester-dashboard {
  padding: 0;
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
}

.header-content {
  text-align: center;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.dashboard-description {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.user-selection-section {
  padding: 2rem 0;
}

.dashboard-content {
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-info-card {
  background: var(--card-background);
  border: 1px solid var(--border-color);
}

.user-info-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar-large {
  width: 64px;
  height: 64px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.user-info-details h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-info-details p {
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
}

.requests-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.requests-stats {
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
  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-description {
    font-size: 1rem;
  }

  .user-info-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .user-avatar-large {
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }

  .requests-header {
    flex-direction: column;
    align-items: stretch;
  }

  .requests-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>