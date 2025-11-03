<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3 class="modal-title">Edit User</h3>
        <button 
          @click="$emit('cancel')"
          class="modal-close"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="edit-form">
          <div class="form-group">
            <label for="edit-name" class="form-label">
              Full Name <span class="required">*</span>
            </label>
            <input
              id="edit-name"
              v-model="form.name"
              type="text"
              class="form-input"
              :class="{ 'error': errors.name }"
              placeholder="Enter full name"
              required
            />
            <div v-if="errors.name" class="error-message">
              {{ errors.name }}
            </div>
          </div>

          <div class="form-group">
            <label for="edit-email" class="form-label">
              Email Address <span class="required">*</span>
            </label>
            <input
              id="edit-email"
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'error': errors.email }"
              placeholder="Enter email address"
              required
            />
            <div v-if="errors.email" class="error-message">
              {{ errors.email }}
            </div>
          </div>

          <div class="form-group">
            <label for="edit-role" class="form-label">
              Role <span class="required">*</span>
            </label>
            <select
              id="edit-role"
              v-model="form.role"
              class="form-select"
              :class="{ 'error': errors.role }"
              required
            >
              <option value="">Select a role</option>
              <option value="requester">Employee (Can request vacation)</option>
              <option value="validator">Manager (Can approve/reject requests)</option>
            </select>
            <div v-if="errors.role" class="error-message">
              {{ errors.role }}
            </div>
            <div class="role-warning" v-if="roleChangeWarning">
              <strong>⚠️ Warning:</strong> Changing a user's role may affect their access to vacation requests. 
              {{ roleChangeWarning }}
            </div>
          </div>

          <!-- User Info Display -->
          <div class="user-info-display">
            <h4>User Information</h4>
            <div class="info-row">
              <span class="info-label">User ID:</span>
              <span class="info-value">{{ user.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Created:</span>
              <span class="info-value">{{ formatDate(user.created_at) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Last Updated:</span>
              <span class="info-value">{{ formatDate(user.updated_at) }}</span>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button 
          @click="$emit('cancel')"
          class="btn btn-outline"
          :disabled="loading"
        >
          Cancel
        </button>
        <button 
          @click="handleSubmit"
          class="btn btn-primary"
          :disabled="loading || !isFormValid || !hasChanges"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Updating...' : 'Update User' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { usersAPI } from '@/services/api'
import { formatDate } from '@/utils/helpers'

export default {
  name: 'EditUserModal',
  props: {
    user: {
      type: Object,
      required: true
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true
    }
  },
  emits: ['user-updated', 'update-error', 'cancel'],
  data() {
    return {
      form: {
        name: this.user.name || '',
        email: this.user.email || '',
        role: this.user.role || ''
      },
      errors: {},
      loading: false,
      originalForm: {
        name: this.user.name || '',
        email: this.user.email || '',
        role: this.user.role || ''
      }
    }
  },
  computed: {
    isFormValid() {
      return this.form.name && 
             this.form.email && 
             this.form.role &&
             this.isValidEmail(this.form.email) &&
             Object.keys(this.errors).length === 0
    },

    hasChanges() {
      return this.form.name !== this.originalForm.name ||
             this.form.email !== this.originalForm.email ||
             this.form.role !== this.originalForm.role
    },

    roleChangeWarning() {
      if (this.form.role === this.originalForm.role) return null
      
      if (this.originalForm.role === 'validator' && this.form.role === 'requester') {
        return 'User will lose manager privileges and won\'t be able to approve requests.'
      }
      if (this.originalForm.role === 'requester' && this.form.role === 'validator') {
        return 'User will gain manager privileges and be able to approve vacation requests.'
      }
      return null
    }
  },
  mounted() {
    // Add escape key listener
    document.addEventListener('keydown', this.handleEscape)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    
    // Focus on name input
    this.$nextTick(() => {
      const nameInput = this.$el.querySelector('#edit-name')
      if (nameInput) {
        nameInput.focus()
      }
    })
  },
  
  beforeUnmount() {
    // Remove escape key listener
    document.removeEventListener('keydown', this.handleEscape)
    // Restore body scroll
    document.body.style.overflow = ''
  },
  
  watch: {
    'form.name'() {
      this.validateName()
    },
    'form.email'() {
      this.validateEmail()
    },
    'form.role'() {
      this.validateRole()
    }
  },
  
  methods: {
    validateName() {
      if (this.form.name.length < 2) {
        this.errors.name = 'Name must be at least 2 characters long'
      } else if (this.form.name.length > 100) {
        this.errors.name = 'Name must not exceed 100 characters'
      } else {
        delete this.errors.name
      }
    },

    validateEmail() {
      if (!this.isValidEmail(this.form.email)) {
        this.errors.email = 'Please enter a valid email address'
      } else {
        delete this.errors.email
      }
    },

    validateRole() {
      if (!this.form.role) {
        this.errors.role = 'Please select a role'
      } else {
        delete this.errors.role
      }
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    async handleSubmit() {
      // Final validation
      this.validateName()
      this.validateEmail()
      this.validateRole()

      if (!this.isFormValid || !this.hasChanges) {
        return
      }

      this.loading = true

      try {
        const userData = {
          name: this.form.name.trim(),
          email: this.form.email.trim().toLowerCase(),
          role: this.form.role
        }

        const response = await usersAPI.update(this.user.id, userData)
        this.$emit('user-updated', response.data)

      } catch (error) {
        console.error('Error updating user:', error)
        this.$emit('update-error', error)

        // Handle specific validation errors from the server
        if (error.data && error.data.errors) {
          error.data.errors.forEach(err => {
            if (err.path === 'name') {
              this.errors.name = err.msg
            } else if (err.path === 'email') {
              this.errors.email = err.msg
            } else if (err.path === 'role') {
              this.errors.role = err.msg
            }
          })
        }
      } finally {
        this.loading = false
      }
    },

    handleEscape(event) {
      if (event.key === 'Escape') {
        this.$emit('cancel')
      }
    },
    
    handleOverlayClick(event) {
      if (event.target === event.currentTarget && this.closeOnOverlayClick) {
        this.$emit('cancel')
      }
    },

    formatDate
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: var(--background-color);
  color: var(--text-primary);
}

.modal-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.edit-form {
  margin-bottom: 1.5rem;
}

.required {
  color: var(--error-color);
  font-weight: bold;
}

.error {
  border-color: var(--error-color) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.role-warning {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 6px;
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.5;
}

.user-info-display {
  background: var(--background-color);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  margin-top: 1rem;
}

.user-info-display h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.8125rem;
}

.info-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.modal-footer .btn {
  min-width: 100px;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem 1rem 0 1rem;
    margin-bottom: 1rem;
  }
  
  .modal-body {
    padding: 0 1rem 1rem 1rem;
  }
  
  .modal-footer {
    padding: 0 1rem 1rem 1rem;
    flex-direction: column-reverse;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
  
  .modal-title {
    font-size: 1.125rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>