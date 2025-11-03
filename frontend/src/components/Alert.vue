<template>
  <div v-if="show" class="alert" :class="alertClass">
    <div class="alert-content">
      <div class="alert-icon" v-if="icon">{{ icon }}</div>
      <div class="alert-text">
        <strong v-if="title">{{ title }}</strong>
        <p v-if="message">{{ message }}</p>
        <slot></slot>
      </div>
      <button 
        v-if="dismissible" 
        @click="dismiss" 
        class="alert-close"
        aria-label="Close alert"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Alert',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    show: {
      type: Boolean,
      default: true
    },
    autoHide: {
      type: Boolean,
      default: false
    },
    autoHideDelay: {
      type: Number,
      default: 5000
    }
  },
  emits: ['dismiss'],
  computed: {
    alertClass() {
      return `alert-${this.type}`
    },
    icon() {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      return icons[this.type]
    }
  },
  mounted() {
    if (this.autoHide && this.show) {
      this.startAutoHideTimer()
    }
  },
  watch: {
    show(newVal) {
      if (newVal && this.autoHide) {
        this.startAutoHideTimer()
      }
    }
  },
  methods: {
    dismiss() {
      this.$emit('dismiss')
    },
    startAutoHideTimer() {
      setTimeout(() => {
        this.dismiss()
      }, this.autoHideDelay)
    }
  }
}
</script>

<style scoped>
.alert {
  margin-bottom: 1rem;
  border-radius: 6px;
  border: 1px solid transparent;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
}

.alert-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.alert-text {
  flex: 1;
}

.alert-text strong {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.alert-text p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.alert-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.alert-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Alert variants */
.alert-success {
  background-color: #d1fae5;
  border-color: #a7f3d0;
  color: #065f46;
}

.alert-error {
  background-color: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

.alert-warning {
  background-color: #fef3c7;
  border-color: #fde68a;
  color: #92400e;
}

.alert-info {
  background-color: #dbeafe;
  border-color: #bfdbfe;
  color: #1e40af;
}
</style>