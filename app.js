// Full-Screen Task Manager Application
class TaskManagerApp {
    constructor() {
        // Initialize with provided data
        this.authData = {
            "users": [
                {"id": 1, "name": "Mohin Ahmed", "email": "mohin@example.com", "password": "demo123", "avatar": "👨‍💻", "createdAt": "2025-10-01"},
                {"id": 2, "name": "Sarah Johnson", "email": "sarah@example.com", "password": "demo123", "avatar": "👩‍💼", "createdAt": "2025-10-02"}
            ],
            "currentUser": null,
            "isAuthenticated": false,
            "isGuest": false,
            "sessionToken": null
        };

        this.appData = {
            "user": {"name": "User", "avatar": "👨‍💻", "preferences": {"theme": "light", "defaultView": "timeline"}},
            "stats": {"totalTasks": 25, "pendingTasks": 18, "completedTasks": 7, "todayTasks": 8},
            "projects": [{
                "id": 1,
                "title": "Space App Design",
                "category": "Team Member",
                "progress": 19,
                "timeStart": "10:30",
                "timeEnd": "13:30",
                "daysLeft": 5,
                "teamMembers": ["👨‍💻", "👩‍🎨", "👨‍🔬"],
                "icon": "🚀",
                "color": "#FF6B6B"
            }],
            "tasks": [
                {"id": 1, "title": "Lunch with client", "category": "Ask Secretary", "time": "10:30", "priority": "high", "completed": false, "createdAt": "2025-10-07T10:00:00Z", "projectId": null, "estimatedDuration": 90},
                {"id": 2, "title": "Check Emails", "category": "Open pc", "time": "13:45", "priority": "medium", "completed": false, "createdAt": "2025-10-07T09:00:00Z", "projectId": null, "estimatedDuration": 30},
                {"id": 3, "title": "Team Meeting", "category": "Conference Room", "time": "15:00", "priority": "high", "completed": false, "createdAt": "2025-10-07T08:00:00Z", "projectId": 1, "estimatedDuration": 60},
                {"id": 4, "title": "Review Design Mockups", "category": "Design Review", "time": "16:30", "priority": "medium", "completed": true, "createdAt": "2025-10-07T07:00:00Z", "projectId": 1, "estimatedDuration": 45}
            ],
            "categories": [
                {"name": "Work", "color": "#FF6B6B", "icon": "💼"},
                {"name": "Personal", "color": "#4ECDC4", "icon": "👤"},
                {"name": "Meeting", "color": "#FFB347", "icon": "🤝"},
                {"name": "Design", "color": "#A374D4", "icon": "🎨"},
                {"name": "Development", "color": "#6BCF7F", "icon": "💻"}
            ]
        };

        this.nextTaskId = 5;
        this.currentScreen = 'welcome';
        this.filteredTasks = [...this.appData.tasks];
        this.isNavMenuOpen = false;
        this.isSearchActive = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.setViewportHeight();
        this.preventScrolling();
        this.bindEvents();
        this.showScreen('welcome');
        this.createNavigationMenu();
    }

    setViewportHeight() {
        // Perfect viewport height calculation for mobile
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    preventScrolling() {
        // Prevent any scrolling on the body and document
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Prevent scroll restoration
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // Prevent touchmove events that could cause scrolling
        document.addEventListener('touchmove', (e) => {
            // Only allow scrolling within elements with 'scrollable' class
            if (!e.target.closest('.scrollable')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    createNavigationMenu() {
        // Create navigation overlay and menu
        const navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        navOverlay.id = 'navOverlay';
        
        const navMenu = document.createElement('div');
        navMenu.className = 'nav-menu';
        navMenu.id = 'navMenu';
        
        navMenu.innerHTML = `
            <div class="nav-header">
                <h3>Menu</h3>
            </div>
            <div class="nav-item active" id="navDashboard">
                <span class="nav-icon">📊</span>
                <span>Dashboard</span>
            </div>
            <div class="nav-item" id="navTasks">
                <span class="nav-icon">✓</span>
                <span>All Tasks</span>
            </div>
            <div class="nav-item" id="navProjects">
                <span class="nav-icon">📁</span>
                <span>Projects</span>
            </div>
            <div class="nav-item" id="navCalendar">
                <span class="nav-icon">📅</span>
                <span>Calendar</span>
            </div>
            <div class="nav-item" id="navStats">
                <span class="nav-icon">📈</span>
                <span>Statistics</span>
            </div>
            <div class="nav-item" id="navSettings">
                <span class="nav-icon">⚙️</span>
                <span>Settings</span>
            </div>
        `;
        
        document.body.appendChild(navOverlay);
        document.body.appendChild(navMenu);
        
        // Bind navigation events
        navOverlay.addEventListener('click', () => this.toggleNavMenu());
        
        // Bind navigation item clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavItemClick(e));
        });
    }

    bindEvents() {
        // Welcome Screen Events
        this.bindElement('loginBtn', 'click', () => this.showScreen('login'));
        this.bindElement('signupBtn', 'click', () => this.showScreen('signup'));
        this.bindElement('guestBtn', 'click', () => this.handleGuestLogin());

        // Auth Screen Events
        this.bindElement('loginBackBtn', 'click', () => this.showScreen('welcome'));
        this.bindElement('signupBackBtn', 'click', () => this.showScreen('welcome'));
        this.bindElement('switchToSignup', 'click', () => this.showScreen('signup'));
        this.bindElement('switchToLogin', 'click', () => this.showScreen('login'));

        // Form Events
        this.bindElement('loginForm', 'submit', (e) => this.handleLogin(e));
        this.bindElement('signupForm', 'submit', (e) => this.handleSignup(e));

        // Password Strength
        this.bindElement('signupPassword', 'input', (e) => this.updatePasswordStrength(e.target.value));

        // Dashboard Events
        this.bindElement('menuBtn', 'click', () => this.toggleNavMenu());
        this.bindElement('searchBtn', 'click', () => this.toggleSearchMode());
        this.bindElement('searchInput', 'input', (e) => this.handleSearch(e.target.value));
        this.bindElement('searchInput', 'focus', () => this.activateSearchMode());
        this.bindElement('searchInput', 'blur', () => this.deactivateSearchMode());
        this.bindElement('floatingBtn', 'click', () => this.showAddTaskModal());
        this.bindElement('profileBtn', 'click', () => this.toggleProfileDropdown());

        // Modal Events
        this.bindModalEvents();

        // Task Events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-indicator') && !e.target.classList.contains('completed')) {
                this.toggleTaskCompletion(e);
            }
            
            // Close dropdown when clicking outside
            if (!e.target.closest('#profileBtn') && !e.target.closest('#profileDropdown')) {
                this.hideProfileDropdown();
            }
        });

        // Keyboard Events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAddTaskModal();
                this.hideProfileDropdown();
                if (this.isNavMenuOpen) {
                    this.toggleNavMenu();
                }
                if (this.isSearchActive) {
                    this.deactivateSearchMode();
                }
            }
        });

        // Window Events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
    }

    bindElement(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    bindModalEvents() {
        const modal = document.getElementById('addTaskModal');
        const modalBackdrop = document.getElementById('modalBackdrop');
        const modalClose = document.getElementById('modalClose');
        const cancelBtn = document.getElementById('cancelBtn');
        const taskForm = document.getElementById('taskForm');

        if (modalBackdrop) modalBackdrop.addEventListener('click', () => this.hideAddTaskModal());
        if (modalClose) modalClose.addEventListener('click', () => this.hideAddTaskModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideAddTaskModal());
        if (taskForm) taskForm.addEventListener('submit', (e) => this.handleAddTask(e));

        // Profile dropdown events
        this.bindElement('logoutItem', 'click', () => this.handleLogout());
    }

    handleResize() {
        this.setViewportHeight();
        
        // Close any open dropdowns and menus on resize
        this.hideProfileDropdown();
        if (this.isNavMenuOpen) {
            this.toggleNavMenu();
        }
    }

    handleOrientationChange() {
        // Handle orientation change with a delay to ensure proper viewport calculation
        setTimeout(() => {
            this.setViewportHeight();
        }, 100);
    }

    toggleNavMenu() {
        const navMenu = document.getElementById('navMenu');
        const navOverlay = document.getElementById('navOverlay');
        const menuBtn = document.getElementById('menuBtn');
        
        if (navMenu && navOverlay && menuBtn) {
            this.isNavMenuOpen = !this.isNavMenuOpen;
            
            if (this.isNavMenuOpen) {
                navMenu.classList.add('active');
                navOverlay.classList.add('active');
                menuBtn.classList.add('active');
                document.body.classList.add('modal-open');
            } else {
                navMenu.classList.remove('active');
                navOverlay.classList.remove('active');
                menuBtn.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        }
    }

    handleNavItemClick(e) {
        const navItem = e.currentTarget;
        const itemId = navItem.id;
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
        
        // Handle navigation
        switch (itemId) {
            case 'navDashboard':
                this.showToast('Dashboard view activated', 'success');
                break;
            case 'navTasks':
                this.showToast('All Tasks view - Coming soon!', 'info');
                break;
            case 'navProjects':
                this.showToast('Projects view - Coming soon!', 'info');
                break;
            case 'navCalendar':
                this.showToast('Calendar view - Coming soon!', 'info');
                break;
            case 'navStats':
                this.showToast('Statistics view - Coming soon!', 'info');
                break;
            case 'navSettings':
                this.showToast('Settings - Coming soon!', 'info');
                break;
        }
        
        // Close menu
        this.toggleNavMenu();
    }

    toggleSearchMode() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn && searchInput) {
            this.isSearchActive = !this.isSearchActive;
            
            if (this.isSearchActive) {
                this.activateSearchMode();
                searchInput.focus();
            } else {
                this.deactivateSearchMode();
            }
        }
    }

    activateSearchMode() {
        const searchBtn = document.getElementById('searchBtn');
        const searchBar = document.querySelector('.search-bar');
        
        if (searchBtn && searchBar) {
            this.isSearchActive = true;
            searchBtn.classList.add('active');
            searchBar.classList.add('active');
        }
    }

    deactivateSearchMode() {
        const searchBtn = document.getElementById('searchBtn');
        const searchBar = document.querySelector('.search-bar');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn && searchBar && searchInput) {
            this.isSearchActive = false;
            searchBtn.classList.remove('active');
            searchBar.classList.remove('active');
            
            // Clear search if no value
            if (!searchInput.value.trim()) {
                this.handleSearch('');
            }
        }
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;

            // Initialize screen-specific functionality
            if (screenName === 'dashboard') {
                setTimeout(() => this.initializeDashboard(), 100);
            }
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.getElementById('loginSubmitBtn');

        // Clear previous errors
        this.clearFormErrors();

        // Validation
        if (!email) {
            this.showFieldError('loginEmail', 'Please enter your email address');
            return;
        }
        if (!this.validateEmail(email)) {
            this.showFieldError('loginEmail', 'Please enter a valid email address');
            return;
        }
        if (!password) {
            this.showFieldError('loginPassword', 'Please enter your password');
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        // Simulate API call
        setTimeout(() => {
            const user = this.authData.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.authData.currentUser = user;
                this.authData.isAuthenticated = true;
                this.authData.sessionToken = this.generateSessionToken();
                
                this.appData.user.name = user.name;
                this.appData.user.avatar = user.avatar;
                
                this.showScreen('dashboard');
                this.showToast('Welcome back! Login successful.', 'success');
            } else {
                this.showFieldError('loginPassword', 'Invalid email or password. Try: mohin@example.com / demo123');
            }
            
            this.setButtonLoading(submitBtn, false);
        }, 1000);
    }

    handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const submitBtn = document.getElementById('signupSubmitBtn');

        // Clear previous errors
        this.clearFormErrors();

        // Validation
        if (!name) {
            this.showFieldError('signupName', 'Please enter your full name');
            return;
        }
        if (!email) {
            this.showFieldError('signupEmail', 'Please enter your email address');
            return;
        }
        if (!this.validateEmail(email)) {
            this.showFieldError('signupEmail', 'Please enter a valid email address');
            return;
        }
        if (this.authData.users.find(u => u.email === email)) {
            this.showFieldError('signupEmail', 'This email is already registered');
            return;
        }
        if (!password) {
            this.showFieldError('signupPassword', 'Please create a password');
            return;
        }
        if (password.length < 6) {
            this.showFieldError('signupPassword', 'Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            this.showFieldError('signupConfirmPassword', 'Passwords do not match');
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        // Simulate API call
        setTimeout(() => {
            const newUser = {
                id: this.authData.users.length + 1,
                name: name,
                email: email,
                password: password,
                avatar: this.getRandomAvatar(),
                createdAt: new Date().toISOString().split('T')[0]
            };

            this.authData.users.push(newUser);
            this.authData.currentUser = newUser;
            this.authData.isAuthenticated = true;
            this.authData.sessionToken = this.generateSessionToken();
            
            this.appData.user.name = newUser.name;
            this.appData.user.avatar = newUser.avatar;
            
            this.showScreen('dashboard');
            this.showToast('Account created successfully! Welcome aboard.', 'success');
            this.setButtonLoading(submitBtn, false);
        }, 1500);
    }

    handleGuestLogin() {
        this.authData.isGuest = true;
        this.authData.currentUser = {
            id: 0,
            name: "Guest User",
            email: "guest@example.com",
            avatar: "👤"
        };
        
        this.appData.user.name = "Guest User";
        this.appData.user.avatar = "👤";
        
        this.showScreen('dashboard');
        this.showToast('Welcome! You are browsing as a guest.', 'success');
    }

    handleLogout() {
        this.authData.currentUser = null;
        this.authData.isAuthenticated = false;
        this.authData.isGuest = false;
        this.authData.sessionToken = null;
        
        this.hideProfileDropdown();
        this.showScreen('welcome');
        this.showToast('You have been logged out successfully.', 'success');
        
        // Reset forms
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
    }

    initializeDashboard() {
        this.updateGreeting();
        this.renderOngoingProject();
        this.renderTodaysTasks();
        this.updateTaskStats();
    }

    updateGreeting() {
        const greeting = document.getElementById('greeting');
        const taskCount = document.getElementById('taskCount');
        
        if (greeting && taskCount) {
            const hour = new Date().getHours();
            let greetingText = 'Hello';
            
            if (hour < 12) {
                greetingText = 'Good Morning';
            } else if (hour < 17) {
                greetingText = 'Good Afternoon';
            } else {
                greetingText = 'Good Evening';
            }
            
            greeting.textContent = `${greetingText} ${this.appData.user.name}`;
            
            const pendingTasks = this.appData.tasks.filter(task => !task.completed).length;
            taskCount.textContent = `${pendingTasks} Tasks are pending`;
        }
    }

    renderOngoingProject() {
        const projectContainer = document.getElementById('ongoingProject');
        if (!projectContainer) return;

        const project = this.appData.projects[0];
        const teamAvatars = project.teamMembers.map(member => 
            `<div class="team-avatar">${member}</div>`
        ).join('');

        projectContainer.innerHTML = `
            <div class="project-header">
                <div class="project-info">
                    <h4>${project.title}</h4>
                    <p class="project-category">${project.category}</p>
                </div>
                <div class="project-icon">${project.icon}</div>
            </div>
            
            <div class="progress-section">
                <div class="progress-header">
                    <span class="progress-label">Progress</span>
                    <span class="progress-value">${project.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
            </div>
            
            <div class="project-footer">
                <div class="project-team">
                    <div class="team-avatars">${teamAvatars}</div>
                </div>
                <div class="project-time">
                    <div class="time-range">${this.formatTime(project.timeStart)} to ${this.formatTime(project.timeEnd)}</div>
                    <div class="days-left">${project.daysLeft} Days left</div>
                </div>
            </div>
        `;
    }

    renderTodaysTasks() {
        const tasksContainer = document.getElementById('tasksTimeline');
        if (!tasksContainer) return;
        
        const tasksHTML = this.filteredTasks.map(task => {
            const completedClass = task.completed ? 'completed' : '';
            const indicatorContent = task.completed ? '✓' : '';
            const indicatorClass = task.completed ? 'completed' : task.priority;
            
            return `
                <div class="task-item ${completedClass}" data-task-id="${task.id}">
                    <div class="task-time">${this.formatTime(task.time)}</div>
                    <div class="task-indicator ${indicatorClass}">${indicatorContent}</div>
                    <div class="task-details">
                        <h4 class="task-title">${task.title}</h4>
                        <p class="task-category">${task.category}</p>
                    </div>
                </div>
            `;
        }).join('');

        tasksContainer.innerHTML = tasksHTML;
    }

    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredTasks = [...this.appData.tasks];
        } else {
            this.filteredTasks = this.appData.tasks.filter(task =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        this.renderTodaysTasks();
        
        // Show search feedback
        if (searchTerm.trim()) {
            const resultCount = this.filteredTasks.length;
            this.showToast(`Found ${resultCount} task${resultCount !== 1 ? 's' : ''} matching "${searchTerm}"`, 'info');
        }
    }

    toggleTaskCompletion(e) {
        const taskItem = e.target.closest('.task-item');
        const taskId = parseInt(taskItem.dataset.taskId);
        const task = this.appData.tasks.find(t => t.id === taskId);
        
        if (task && !task.completed) {
            task.completed = true;
            
            // Animate the completion
            const indicator = e.target;
            indicator.classList.add('completed');
            indicator.textContent = '✓';
            
            taskItem.classList.add('completed');
            
            // Update stats and show feedback
            setTimeout(() => {
                this.updateTaskStats();
                this.showToast(`"${task.title}" completed!`, 'success');
            }, 300);
        }
    }

    showAddTaskModal() {
        const modal = document.getElementById('addTaskModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            
            // Focus on title input
            setTimeout(() => {
                const titleInput = document.getElementById('taskTitle');
                if (titleInput) titleInput.focus();
            }, 100);
            
            // Set default time to current time + 1 hour
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const timeString = now.toTimeString().slice(0, 5);
            const timeInput = document.getElementById('taskTime');
            if (timeInput) timeInput.value = timeString;
        }
    }

    hideAddTaskModal() {
        const modal = document.getElementById('addTaskModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
            
            // Reset form
            const taskForm = document.getElementById('taskForm');
            if (taskForm) taskForm.reset();
            
            this.clearFormErrors();
        }
    }

    handleAddTask(e) {
        e.preventDefault();
        const titleInput = document.getElementById('taskTitle');
        const categorySelect = document.getElementById('taskCategory');
        const prioritySelect = document.getElementById('taskPriority');
        const timeInput = document.getElementById('taskTime');
        
        const title = titleInput.value.trim();
        
        if (!title) {
            this.showFieldError('taskTitle', 'Please enter a task title');
            return;
        }
        
        const newTask = {
            id: this.nextTaskId++,
            title: title,
            category: categorySelect.value,
            time: timeInput.value || '12:00',
            completed: false,
            priority: prioritySelect.value,
            createdAt: new Date().toISOString(),
            projectId: null,
            estimatedDuration: 60
        };
        
        // Add to tasks array
        this.appData.tasks.push(newTask);
        this.filteredTasks = [...this.appData.tasks];
        
        // Re-render tasks and update stats
        this.renderTodaysTasks();
        this.updateTaskStats();
        
        // Hide modal and show success
        this.hideAddTaskModal();
        this.showToast('Task added successfully!', 'success');
    }

    toggleProfileDropdown() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    hideProfileDropdown() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let text = 'Very weak';
        
        if (password.length >= 6) strength += 1;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
        if (password.match(/\d/)) strength += 1;
        if (password.match(/[^a-zA-Z\d]/)) strength += 1;
        
        strengthBar.className = 'strength-fill';
        
        if (strength === 0) {
            text = 'Very weak';
        } else if (strength === 1) {
            strengthBar.classList.add('weak');
            text = 'Weak';
        } else if (strength === 2 || strength === 3) {
            strengthBar.classList.add('medium');
            text = 'Medium';
        } else if (strength === 4) {
            strengthBar.classList.add('strong');
            text = 'Strong';
        }
        
        strengthText.textContent = text;
    }

    updateTaskStats() {
        const completedTasks = this.appData.tasks.filter(task => task.completed).length;
        const totalTasks = this.appData.tasks.length;
        const pendingTasks = totalTasks - completedTasks;
        
        this.appData.stats.totalTasks = totalTasks;
        this.appData.stats.completedTasks = completedTasks;
        this.appData.stats.pendingTasks = pendingTasks;
        
        this.updateGreeting();
    }

    // Utility Methods
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    formatTime(time24) {
        if (!time24) return 'No time';
        
        const [hours, minutes] = time24.split(':');
        const hour12 = ((parseInt(hours) + 11) % 12) + 1;
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    generateSessionToken() {
        return 'session_' + Math.random().toString(36).substr(2, 9);
    }

    getRandomAvatar() {
        const avatars = ['👨‍💻', '👩‍💼', '👨‍🎨', '👩‍🔬', '👨‍🚀', '👩‍⚕️', '👨‍🏫', '👩‍💻'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Remove existing error
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        // Add error styling
        field.style.borderColor = 'var(--color-error)';
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        
        // Focus the field
        field.focus();
        
        // Clear error on input
        const clearError = () => {
            field.style.borderColor = '';
            if (errorDiv && errorDiv.parentNode) {
                errorDiv.remove();
            }
            field.removeEventListener('input', clearError);
        };
        field.addEventListener('input', clearError);
    }

    clearFormErrors() {
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('.form-control').forEach(field => {
            field.style.borderColor = '';
        });
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        if (type === 'error') {
            toast.style.background = 'var(--color-error)';
        } else if (type === 'warning') {
            toast.style.background = 'var(--color-warning)';
        } else if (type === 'info') {
            toast.style.background = 'var(--color-info)';
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Remove after 4 seconds
        setTimeout(() => {
            toast.classList.add('slide-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    window.taskManagerApp = new TaskManagerApp();
});

// Export for debugging
window.TaskManagerApp = TaskManagerApp;