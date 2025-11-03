<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button 
          @click="$emit('cancel')"
          class="modal-close"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="icon" class="modal-icon" :class="`modal-icon-${type}`">
          {{ icon }}
        </div>
        <div class="modal-message">
          <p>{{ message }}</p>
          <slot></slot>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          @click="$emit('cancel')"
          class="btn btn-outline"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="$emit('confirm')"
          class="btn"
          :class="confirmButtonClass"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmationModal',
  props: {
    title: {
      type: String,
      default: 'Confirm Action'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'danger', 'warning', 'success'].includes(value)
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
  computed: {
    icon() {
      const icons = {
        primary: 'ℹ️',
        danger: '⚠️',
        warning: '⚠️',
        success: '✅'
      }
      return icons[this.type]
    },
    
    confirmButtonClass() {
      const classes = {
        primary: 'btn-primary',
        danger: 'btn-danger',
        warning: 'btn-warning',
        success: 'btn-success'
      }
      return classes[this.type]
    }
  },
  mounted() {
    // Add escape key listener
    document.addEventListener('keydown', this.handleEscape)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  },
  
  beforeUnmount() {
    // Remove escape key listener
    document.removeEventListener('keydown', this.handleEscape)
    // Restore body scroll
    document.body.style.overflow = ''
  },
  
  methods: {
    handleEscape(event) {
      if (event.key === 'Escape') {
        this.$emit('cancel')
      }
    },
    
    handleOverlayClick(event) {
      if (event.target === event.currentTarget && this.closeOnOverlayClick) {
        this.$emit('cancel')
      }
    }
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
  padding: 1.5rem;
  text-align: center;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-icon-danger {
  color: var(--error-color);
}

.modal-icon-warning {
  color: var(--warning-color);
}

.modal-icon-success {
  color: var(--success-color);
}

.modal-icon-primary {
  color: var(--primary-color);
}

.modal-message {
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-message p {
  margin: 0;
  font-size: 1rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  justify-content: flex-end;
}

.modal-footer .btn {
  min-width: 100px;
}

/* Button variants for warnings */
.btn-warning {
  background-color: var(--warning-color);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background-color: #d97706;
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
  }
  
  .modal-body {
    padding: 1rem;
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
  
  .modal-icon {
    font-size: 2.5rem;
  }
}
</style>