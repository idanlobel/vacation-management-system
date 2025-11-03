<template>
  <div class="user-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-row">
        <div class="form-group">
          <label for="name" class="form-label">
            Full Name <span class="required">*</span>
          </label>
          <input
            id="name"
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
          <label for="email" class="form-label">
            Email Address <span class="required">*</span>
          </label>
          <input
            id="email"
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
      </div>

      <div class="form-group">
        <label for="role" class="form-label">
          Role <span class="required">*</span>
        </label>
        <select
          id="role"
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
        <div class="role-description">
          <div v-if="form.role === 'requester'" class="role-info employee">
            <strong>Employee:</strong> Can submit vacation requests and view their own request history
          </div>
          <div v-if="form.role === 'validator'" class="role-info manager">
            <strong>Manager:</strong> Can review all vacation requests and approve/reject them with comments
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="!isFormValid || loading"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Creating...' : 'Create User' }}
        </button>
        
        <button 
          type="button" 
          @click="resetForm"
          class="btn btn-outline"
          :disabled="loading"
        >
          Reset
        </button>
      </div>
    </form>

    <!-- Preview Card -->
    <div v-if="form.name && form.email && form.role" class="preview-section">
      <h3>Preview</h3>
      <div class="user-preview-card">
        <div class="user-preview-avatar">
          {{ form.name.charAt(0).toUpperCase() }}
        </div>
        <div class="user-preview-details">
          <h4>{{ form.name }}</h4>
          <p>{{ form.email }}</p>
          <span class="badge" :class="getRoleBadgeClass(form.role)">
            {{ capitalize(form.role === 'requester' ? 'Employee' : 'Manager') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usersAPI } from '@/services/api'
import { capitalize } from '@/utils/helpers'

export default {
  name: 'UserForm',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['user-created', 'creation-error'],
  data() {
    return {
      form: {
        name: '',
        email: '',
        role: ''
      },
      errors: {}
    }
  },
  computed: {
    isFormValid() {
      return this.form.name && 
             this.form.email && 
             this.form.role &&
             this.isValidEmail(this.form.email) &&
             Object.keys(this.errors).length === 0
    }
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

      if (!this.isFormValid) {
        return
      }

      try {
        const userData = {
          name: this.form.name.trim(),
          email: this.form.email.trim().toLowerCase(),
          role: this.form.role
        }

        const response = await usersAPI.create(userData)
        this.$emit('user-created', response.data)
        this.resetForm()

      } catch (error) {
        console.error('Error creating user:', error)
        this.$emit('creation-error', error)

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
      }
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        role: ''
      }
      this.errors = {}
    },

    getRoleBadgeClass(role) {
      return role === 'validator' ? 'badge-approved' : 'badge-pending'
    },

    capitalize
  }
}
</script>

<style scoped>
.user-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.role-description {
  margin-top: 0.5rem;
}

.role-info {
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  line-height: 1.5;
}

.role-info.employee {
  background-color: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
  color: #1e40af;
}

.role-info.manager {
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #047857;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions .btn {
  flex: 1;
}

.preview-section {
  background: var(--background-color);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.preview-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-preview-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.user-preview-avatar {
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.user-preview-details {
  flex: 1;
}

.user-preview-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-preview-details p {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .user-form {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }

  .user-preview-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .user-preview-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

@media (min-width: 769px) {
  .user-form {
    grid-template-columns: 2fr 1fr;
  }
}
</style>