<template>
  <div id="app">
    <!-- Navigation Header -->
    <header class="app-header">
      <nav class="container">
        <div class="nav-content">
          <router-link to="/" class="nav-brand">
            <h1>🏖️ Vacation Management</h1>
          </router-link>
          
          <div class="nav-links">
            <router-link 
              to="/" 
              class="nav-link"
              :class="{ active: $route.name === 'Home' }"
            >
              Home
            </router-link>
            <router-link 
              to="/requester" 
              class="nav-link"
              :class="{ active: $route.path.startsWith('/requester') }"
            >
              Employee Portal
            </router-link>
            <router-link 
              to="/validator" 
              class="nav-link"
              :class="{ active: $route.path.startsWith('/validator') }"
            >
              Manager Portal
            </router-link>
            <router-link 
              to="/users" 
              class="nav-link"
              :class="{ active: $route.path.startsWith('/users') }"
            >
              User Management
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container">
        <p>&copy; 2024 Vacation Management System. Built with Vue.js and Node.js.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.nav-brand {
  text-decoration: none;
  color: var(--text-primary);
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--primary-color);
  background-color: var(--background-color);
}

.nav-link.active {
  color: var(--primary-color);
  background-color: rgba(37, 99, 235, 0.1);
}

.app-main {
  min-height: calc(100vh - 120px);
  padding: 2rem 0;
}

.app-footer {
  background: var(--card-background);
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 0;
  margin-top: auto;
}

.app-footer p {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-brand h1 {
    font-size: 1.25rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .app-main {
    padding: 1rem 0;
  }
}
</style>