<template>
  <div class="vacation-request-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="start-date" class="form-label">
          Start Date <span class="required">*</span>
        </label>
        <input
          id="start-date"
          v-model="form.startDate"
          type="date"
          class="form-input"
          :class="{ 'error': errors.startDate }"
          :min="minDate"
          required
        />
        <div v-if="errors.startDate" class="error-message">
          {{ errors.startDate }}
        </div>
      </div>

      <div class="form-group">
        <label for="end-date" class="form-label">
          End Date <span class="required">*</span>
        </label>
        <input
          id="end-date"
          v-model="form.endDate"
          type="date"
          class="form-input"
          :class="{ 'error': errors.endDate }"
          :min="form.startDate || minDate"
          required
        />
        <div v-if="errors.endDate" class="error-message">
          {{ errors.endDate }}
        </div>
      </div>

      <div v-if="duration > 0" class="duration-info">
        <span class="duration-badge">
          {{ duration }} {{ duration === 1 ? 'day' : 'days' }}
        </span>
      </div>

      <div class="form-group">
        <label for="reason" class="form-label">
          Reason (optional)
        </label>
        <textarea
          id="reason"
          v-model="form.reason"
          class="form-textarea"
          placeholder="Enter the reason for your vacation request..."
          rows="3"
          maxlength="500"
        ></textarea>
        <div class="character-count">
          {{ form.reason.length }}/500 characters
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="!isFormValid || submitting"
        >
          <span v-if="submitting" class="spinner"></span>
          {{ submitting ? 'Submitting...' : 'Submit Request' }}
        </button>
        
        <button 
          type="button" 
          @click="resetForm"
          class="btn btn-outline"
          :disabled="submitting"
        >
          Reset
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { vacationRequestsAPI } from '@/services/api'
import { calculateDuration, validateDateRange, formatDateForInput } from '@/utils/helpers'

export default {
  name: 'VacationRequestForm',
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['request-submitted', 'submission-error'],
  data() {
    return {
      form: {
        startDate: '',
        endDate: '',
        reason: ''
      },
      errors: {},
      submitting: false
    }
  },
  computed: {
    minDate() {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return formatDateForInput(tomorrow)
    },
    
    duration() {
      if (!this.form.startDate || !this.form.endDate) return 0
      return calculateDuration(this.form.startDate, this.form.endDate)
    },
    
    isFormValid() {
      return this.form.startDate && 
             this.form.endDate && 
             Object.keys(this.errors).length === 0
    }
  },
  watch: {
    'form.startDate'() {
      this.validateDates()
    },
    'form.endDate'() {
      this.validateDates()
    }
  },
  methods: {
    validateDates() {
      this.errors = {}
      
      if (!this.form.startDate || !this.form.endDate) return
      
      const validation = validateDateRange(this.form.startDate, this.form.endDate)
      
      if (!validation.isValid) {
        if (validation.message.includes('before end date')) {
          this.errors.endDate = validation.message
        } else if (validation.message.includes('future')) {
          this.errors.startDate = validation.message
        } else {
          this.errors.startDate = validation.message
        }
      }
    },
    
    async handleSubmit() {
      // Final validation
      this.validateDates()
      
      if (!this.isFormValid) {
        return
      }
      
      this.submitting = true
      
      try {
        const requestData = {
          user_id: parseInt(this.userId),
          start_date: this.form.startDate,
          end_date: this.form.endDate,
          reason: this.form.reason.trim() || null
        }
        
        const response = await vacationRequestsAPI.create(requestData)
        
        this.$emit('request-submitted', response.data)
        this.resetForm()
        
      } catch (error) {
        console.error('Error submitting vacation request:', error)
        this.$emit('submission-error', error)
        
        // Handle specific validation errors from the server
        if (error.data && error.data.errors) {
          error.data.errors.forEach(err => {
            if (err.path === 'start_date') {
              this.errors.startDate = err.msg
            } else if (err.path === 'end_date') {
              this.errors.endDate = err.msg
            }
          })
        }
      } finally {
        this.submitting = false
      }
    },
    
    resetForm() {
      this.form = {
        startDate: '',
        endDate: '',
        reason: ''
      }
      this.errors = {}
    }
  }
}
</script>

<style scoped>
.vacation-request-form {
  max-width: 600px;
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

.duration-info {
  margin: 1rem 0;
  text-align: center;
}

.duration-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
}

.character-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions .btn {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}
</style>