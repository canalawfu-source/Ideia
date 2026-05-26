// State Management
let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let currentDate = new Date(); // Tracks the currently viewed month

// DOM Elements
const calendarDaysContainer = document.getElementById('calendar-days');
const monthYearDisplay = document.getElementById('month-year-display');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const workoutForm = document.getElementById('workout-form');
const selectedDateInput = document.getElementById('workout-date');
const totalDistanceDisplay = document.getElementById('total-distance');

const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

// Initialize App
function init() {
    renderCalendar();
    updateStats();
    
    // Default the form date to today
    const todayStr = new Date().toISOString().split('T')[0];
    selectedDateInput.value = todayStr;
}

// Render Calendar Logic
function renderCalendar() {
    calendarDaysContainer.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYearDisplay.innerText = `${months[month]} ${year}`;
    
    // Get first day of the month and total number of days in the month
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // 1. Render Blank Spaces for previous month overlap
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('calendar-day', 'empty');
        calendarDaysContainer.appendChild(emptyDiv);
    }
    
    // 2. Render Actual Days
    for (let day = 1; day <= lastDay; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        
        // Construct the date string in standard YYYY-MM-DD
        const currentDayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayDiv.dataset.date = currentDayString;
        
        // Add Day Number
        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.innerText = day;
        dayDiv.appendChild(dayNumber);
        
        // Check if the current day string matches the form input selection value
        if (selectedDateInput.value === currentDayString) {
            dayDiv.classList.add('selected');
        }

        // Filter and display matching workouts for this specific day
        const dayWorkouts = workouts.filter(w => w.date === currentDayString);
        dayWorkouts.forEach(workout => {
            const badge = document.createElement('div');
            badge.classList.add('workout-badge', workout.type);
            
            badge.innerHTML = `
                <span class="badge-type">${workout.type}</span>
                <span class="badge-details">${workout.distance}k @ ${workout.pace}</span>
                <button class="delete-btn" data-id="${workout.id}">&times;</button>
            `;
            
            // Prevent the parent day selection logic from firing when deleting
            badge.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteWorkout(workout.id);
            });
            
            dayDiv.appendChild(badge);
        });
        
        // Click Day Event Listener: Updates selection and updates form field
        dayDiv.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            dayDiv.classList.add('selected');
            selectedDateInput.value = currentDayString;
        });
        
        calendarDaysContainer.appendChild(dayDiv);
    }
}

// Add Workout
workoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newWorkout = {
        id: Date.now().toString(),
        date: document.getElementById('workout-date').value,
        type: document.getElementById('workout-type').value,
        distance: parseFloat(document.getElementById('workout-distance').value),
        pace: document.getElementById('workout-pace').value
    };
    
    workouts.push(newWorkout);
    saveToLocalStorage();
    renderCalendar();
    updateStats();
    
    // Clear distance and pace parameters but keep date locked for rapid entry updates
    document.getElementById('workout-distance').value = '';
    document.getElementById('workout-pace').value = '';
});

// Delete Workout
function deleteWorkout(id) {
    workouts = workouts.filter(w => w.id !== id);
    saveToLocalStorage();
    renderCalendar();
    updateStats();
}

// Update Cumulative Distance Volume
function updateStats() {
    const total = workouts.reduce((sum, current) => sum + current.distance, 0);
    totalDistanceDisplay.innerText = total.toFixed(1);
}

function saveToLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

// Navigation Event Listeners
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Sync selection styling if date picker values are manually typed or updated natively
selectedDateInput.addEventListener('change', () => {
    const targetDate = selectedDateInput.value;
    if (targetDate) {
        const parsedDate = new Date(targetDate + 'T00:00:00');
        currentDate.setFullYear(parsedDate.getFullYear());
        currentDate.setMonth(parsedDate.getMonth());
        renderCalendar();
    }
});

// Run Init Engine
init();