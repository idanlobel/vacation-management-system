<template>
  <div class="home-page">
    <div class="container">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">Vacation Management System</h1>
          <p class="hero-description">
            Streamline your vacation request process with our easy-to-use platform. 
            Employees can submit requests and managers can review them efficiently.
          </p>
          
          <div class="hero-actions">
            <router-link to="/requester" class="btn btn-primary btn-lg">
              Employee Portal
            </router-link>
            <router-link to="/validator" class="btn btn-outline btn-lg">
              Manager Portal
            </router-link>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <h2 class="section-title">Key Features</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Easy Request Submission</h3>
            <p>Submit vacation requests with just a few clicks. Add dates, duration, and reasons for your time off.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">👀</div>
            <h3>Request Tracking</h3>
            <p>Track the status of your vacation requests in real-time. Know exactly where your request stands.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">✅</div>
            <h3>Manager Approval</h3>
            <p>Managers can quickly review, approve, or reject requests with optional comments and feedback.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Dashboard Overview</h3>
            <p>Get a comprehensive view of all vacation requests with filtering and sorting capabilities.</p>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works">
        <h2 class="section-title">How It Works</h2>
        
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Submit Request</h3>
              <p>Employees fill out a simple form with vacation dates and reasons.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Manager Review</h3>
              <p>Managers receive notifications and can review requests in their dashboard.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Decision & Feedback</h3>
              <p>Managers approve or reject with optional comments for transparency.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>Confirmation</h3>
              <p>Employees receive immediate updates on their request status.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Access Section -->
      <section class="quick-access">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Quick Access</h2>
            <p class="card-description">Choose your role to get started</p>
          </div>
          
          <div class="access-options">
            <div class="access-option">
              <h3>👥 I'm an Employee</h3>
              <p>Submit and track your vacation requests</p>
              <router-link to="/requester" class="btn btn-primary">
                Go to Employee Portal
              </router-link>
            </div>
            
            <div class="access-option">
              <h3>👔 I'm a Manager</h3>
              <p>Review and manage vacation requests</p>
              <router-link to="/validator" class="btn btn-secondary">
                Go to Manager Portal
              </router-link>
            </div>

            <div class="access-option">
              <h3>⚙️ I'm an Administrator</h3>
              <p>Add and manage employees and managers</p>
              <router-link to="/users" class="btn btn-outline">
                Go to User Management
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home-page {
  padding: 0;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Features Section */
.features {
  padding: 4rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 3rem;
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* How It Works Section */
.how-it-works {
  background: var(--background-color);
  padding: 4rem 0;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-number {
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.step-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.step-content p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Quick Access Section */
.quick-access {
  padding: 4rem 0;
}

.access-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.access-option {
  text-align: center;
  padding: 2rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: border-color 0.2s, background-color 0.2s;
}

.access-option:hover {
  border-color: var(--primary-color);
  background-color: var(--background-color);
}

.access-option h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.access-option p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid,
  .steps {
    grid-template-columns: 1fr;
  }
  
  .access-options {
    grid-template-columns: 1fr;
  }
}
</style>