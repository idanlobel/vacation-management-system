<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div class="error-actions">
          <router-link to="/" class="btn btn-primary">
            Go Home
          </router-link>
          <button @click="goBack" class="btn btn-outline">
            Go Back
          </button>
        </div>
        
        <div class="helpful-links">
          <h3>Popular Pages:</h3>
          <ul>
            <li><router-link to="/requester">Employee Portal</router-link></li>
            <li><router-link to="/validator">Manager Portal</router-link></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      window.history.back()
    }
  }
}
</script>

<style scoped>
.not-found-page {
  padding: 4rem 0;
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.error-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.helpful-links {
  margin-top: 2rem;
}

.helpful-links h3 {
  font-size: 1.125rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.helpful-links ul {
  list-style: none;
  padding: 0;
}

.helpful-links li {
  margin-bottom: 0.5rem;
}

.helpful-links a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.helpful-links a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-description {
    font-size: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>