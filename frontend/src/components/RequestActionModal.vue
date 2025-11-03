<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3 class="modal-title">
          {{ action === 'approve' ? 'Approve' : 'Reject' }} Vacation Request
        </h3>
        <button 
          @click="$emit('cancel')"
          class="modal-close"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Request Details -->
        <div class="request-details">
          <div class="request-info">
            <h4>Request Details</h4>
            <div class="detail-row">
              <span class="detail-label">Employee:</span>
              <span class="detail-value">{{ request.user_name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ request.user_email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Dates:</span>
              <span class="detail-value">
                {{ formatDate(request.start_date) }} - {{ formatDate(request.end_date) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">
                {{ calculateDuration(request.start_date, request.end_date) }} days
              </span>
            </div>
            <div v-if="request.reason" class="detail-row">
              <span class="detail-label">Reason:</span>
              <span class="detail-value">{{ request.reason }}</span>
            </div>
          </div>
        </div>

        <!-- Action Form -->
        <form @submit.prevent="handleSubmit" class="action-form">
          <div class="form-group">
            <label for="comments" class="form-label">
              Comments 
              <span v-if="action === 'reject'" class="required">*</span>
              <span class="optional-note">({{ action === 'approve' ? 'optional' : 'required' }})</span>
            </label>
            <textarea
              id="comments"
              v-model="form.comments"
              class="form-textarea"
              :class="{ 'error': errors.comments }"
              :placeholder="getCommentsPlaceholder()"
              rows="4"
              maxlength="1000"
              :required="action === 'reject'"
            ></textarea>
            <div class="form-footer">
              <div v-if="errors.comments" class="error-message">
                {{ errors.comments }}
              </div>
              <div class="character-count">
                {{ form.comments.length }}/1000 characters
              </div>
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
          class="btn"
          :class="action === 'approve' ? 'btn-success' : 'btn-danger'"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : (action === 'approve' ? 'Approve Request' : 'Reject Request') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, calculateDuration } from '@/utils/helpers'

export default {
  name: 'RequestActionModal',
  props: {
    request: {
      type: Object,
      required: true
    },
    action: {
      type: String,
      required: true,
      validator: (value) => ['approve', 'reject'].includes(value)
    },
    validatorId: {
      type: [String, Number],
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true
    }
  },
  emits: ['confirm', 'cancel'],
  data() {
    return {
      form: {
        comments: ''
      },
      errors: {}
    }
  },
  computed: {
    isFormValid() {
      if (this.action === 'reject') {
        return this.form.comments.trim().length > 0
      }
      return true // Comments are optional for approval
    }
  },
  mounted() {
    // Add escape key listener
    document.addEventListener('keydown', this.handleEscape)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    
    // Focus on textarea
    this.$nextTick(() => {
      const textarea = this.$el.querySelector('#comments')
      if (textarea) {
        textarea.focus()
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
    'form.comments'() {
      this.validateForm()
    }
  },
  
  methods: {
    validateForm() {
      this.errors = {}
      
      if (this.action === 'reject' && !this.form.comments.trim()) {
        this.errors.comments = 'Comments are required when rejecting a request'
      }
      
      if (this.form.comments.length > 1000) {
        this.errors.comments = 'Comments cannot exceed 1000 characters'
      }
    },
    
    handleSubmit() {
      this.validateForm()
      
      if (!this.isFormValid) {
        return
      }
      
      const actionData = {
        validator_id: this.validatorId,
        comments: this.form.comments.trim() || null
      }
      
      this.$emit('confirm', actionData)
    },
    
    getCommentsPlaceholder() {
      if (this.action === 'approve') {
        return 'Add any approval notes or congratulations...'
      } else {
        return 'Please provide a reason for rejecting this request...'
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
    
    formatDate,
    calculateDuration
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
  max-width: 600px;
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

.request-details {
  margin-bottom: 2rem;
}

.request-info {
  background: var(--background-color);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.request-info h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 80px;
}

.detail-value {
  color: var(--text-primary);
  text-align: right;
  word-break: break-word;
}

.action-form {
  margin-top: 1rem;
}

.required {
  color: var(--error-color);
  font-weight: bold;
}

.optional-note {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: normal;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.error {
  border-color: var(--error-color) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  color: var(--error-color);
  font-size: 0.75rem;
}

.character-count {
  font-size: 0.75rem;
  color: var(--text-muted);
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
  min-width: 120px;
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
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-value {
    text-align: left;
  }
  
  .form-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>