<template>
  <div class="user-selector">
    <div class="form-group">
      <label for="user-select" class="form-label">
        {{ label }}
      </label>
      <select
        id="user-select"
        v-model="selectedUserId"
        @change="handleUserChange"
        class="form-select"
        :disabled="loading"
      >
        <option value="">{{ placeholder }}</option>
        <option 
          v-for="user in users" 
          :key="user.id" 
          :value="user.id"
        >
          {{ user.name }} ({{ user.email }})
        </option>
      </select>
    </div>
    
    <div v-if="selectedUser" class="selected-user-info">
      <div class="user-card">
        <div class="user-avatar">
          {{ selectedUser.name.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <h3>{{ selectedUser.name }}</h3>
          <p>{{ selectedUser.email }}</p>
          <span class="user-role badge" :class="getRoleBadgeClass(selectedUser.role)">
            {{ capitalize(selectedUser.role) }}
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
  name: 'UserSelector',
  props: {
    role: {
      type: String,
      required: true,
      validator: (value) => ['requester', 'validator'].includes(value)
    },
    modelValue: {
      type: [String, Number],
      default: null
    },
    label: {
      type: String,
      default: 'Select User'
    },
    placeholder: {
      type: String,
      default: 'Choose a user...'
    }
  },
  emits: ['update:modelValue', 'user-selected'],
  data() {
    return {
      users: [],
      loading: false,
      selectedUserId: this.modelValue
    }
  },
  computed: {
    selectedUser() {
      if (!this.selectedUserId) return null
      return this.users.find(user => user.id == this.selectedUserId)
    }
  },
  watch: {
    modelValue(newValue) {
      this.selectedUserId = newValue
    },
    role() {
      this.fetchUsers()
    }
  },
  async mounted() {
    await this.fetchUsers()
    
    // If we have a modelValue and it's valid, emit the user-selected event
    if (this.selectedUserId && this.selectedUser) {
      this.$emit('user-selected', this.selectedUser)
    }
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const response = await usersAPI.getByRole(this.role)
        this.users = response.data || []
      } catch (error) {
        console.error('Error fetching users:', error)
        this.users = []
      } finally {
        this.loading = false
      }
    },
    
    handleUserChange() {
      this.$emit('update:modelValue', this.selectedUserId)
      
      if (this.selectedUser) {
        this.$emit('user-selected', this.selectedUser)
      } else {
        this.$emit('user-selected', null)
      }
    },
    
    getRoleBadgeClass(role) {
      return role === 'validator' ? 'badge-approved' : 'badge-pending'
    },
    
    capitalize
  }
}
</script>

<style scoped>
.user-selector {
  margin-bottom: 2rem;
}

.selected-user-info {
  margin-top: 1rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.user-avatar {
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

.user-details {
  flex: 1;
}

.user-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-details p {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.user-role {
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .user-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>