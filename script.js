// Smart Meal Planner JavaScript
// This file handles meals, calendar, shopping list and signup.

// -------------------- Storage helpers --------------------
const storageKeys = {
  meals: 'smartMealPlannerMeals',
  calendar: 'smartMealPlannerCalendar',
  shopping: 'smartMealPlannerShopping',
  profiles: 'smartMealPlannerProfiles'
};

function copyData(data) {
  return JSON.parse(JSON.stringify(data));
}

function getSavedData(key, defaultValue) {
  const savedData = localStorage.getItem(key);

  if (savedData) {
    return JSON.parse(savedData);
  }

  return copyData(defaultValue);
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// -------------------- Default data --------------------
const defaultMeals = [
  { id: 1, name: 'Poha', type: 'Breakfast', category: 'Vegetarian', image: 'images/breakfast.svg' },
  { id: 2, name: 'Idli', type: 'Breakfast', category: 'Healthy', image: 'images/breakfast.svg' },
  { id: 3, name: 'Dal Rice', type: 'Lunch', category: 'Vegetarian', image: 'images/lunch.svg' },
  { id: 4, name: 'Veg Pulao', type: 'Lunch', category: 'Healthy', image: 'images/lunch.svg' },
  { id: 5, name: 'Roti Sabzi', type: 'Dinner', category: 'Vegetarian', image: 'images/dinner.svg' },
  { id: 6, name: 'Paneer Tikka', type: 'Dinner', category: 'Healthy', image: 'images/dinner.svg' }
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
const emptyCalendar = {};

for (const day of days) {
  emptyCalendar[day] = {
    Breakfast: '',
    Lunch: '',
    Dinner: ''
  };
}

let meals = getSavedData(storageKeys.meals, defaultMeals);
let calendar = getSavedData(storageKeys.calendar, emptyCalendar);
let shoppingItems = getSavedData(storageKeys.shopping, [
  { id: 1, name: 'Rice', completed: false },
  { id: 2, name: 'Dal', completed: false },
  { id: 3, name: 'Potato', completed: false },
  { id: 4, name: 'Tomato', completed: false },
  { id: 5, name: 'Onion', completed: false },
  { id: 6, name: 'Paneer', completed: false }
]);
let selectedCategory = 'All';

// -------------------- Meal functions --------------------
function createMealCard(meal) {
  return `
    <article class="meal-card">
      <img src="${meal.image}" alt="${meal.name}">
      <div class="meal-content">
        <span class="category-tag">${meal.category}</span>
        <h4>${meal.name}</h4>
        <div class="card-actions">
          <button class="small-button" type="button" data-edit-meal="${meal.id}">Edit</button>
          <button class="small-button delete" type="button" data-delete-meal="${meal.id}">Delete</button>
        </div>
      </div>
    </article>
  `;
}

function renderMeals() {
  const breakfastList = document.querySelector('#breakfast-list');

  // Stop here on pages that do not contain the meal section.
  if (!breakfastList) {
    return;
  }

  for (const type of mealTypes) {
    const list = document.querySelector(`#${type.toLowerCase()}-list`);
    const count = document.querySelector(`#${type.toLowerCase()}-count`);

    const filteredMeals = meals.filter((meal) => {
      const correctType = meal.type === type;
      const correctCategory = selectedCategory === 'All' || meal.category === selectedCategory;
      return correctType && correctCategory;
    });

    count.textContent = `${filteredMeals.length} meal${filteredMeals.length === 1 ? '' : 's'}`;

    if (filteredMeals.length === 0) {
      list.innerHTML = '<p class="empty-message">No meals in this category yet.</p>';
    } else {
      list.innerHTML = filteredMeals.map(createMealCard).join('');
    }
  }
}

function openMealDialog(meal) {
  const dialog = document.querySelector('#meal-dialog');
  const form = document.querySelector('#meal-form');

  document.querySelector('#dialog-title').textContent = meal ? 'Edit meal' : 'Add a meal';
  document.querySelector('#meal-id').value = meal ? meal.id : '';
  document.querySelector('#meal-name').value = meal ? meal.name : '';
  document.querySelector('#meal-type').value = meal ? meal.type : 'Breakfast';
  document.querySelector('#meal-category').value = meal ? meal.category : 'Vegetarian';

  form.dataset.editing = meal ? 'true' : 'false';
  dialog.showModal();
  document.querySelector('#meal-name').focus();
}

function saveMeal(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const mealId = Number(document.querySelector('#meal-id').value);
  const mealType = document.querySelector('#meal-type').value;
  const newMeal = {
    id: mealId || Date.now(),
    name: document.querySelector('#meal-name').value.trim(),
    type: mealType,
    category: document.querySelector('#meal-category').value,
    image: `images/${mealType.toLowerCase()}.svg`
  };

  if (form.dataset.editing === 'true') {
    meals = meals.map((meal) => meal.id === mealId ? newMeal : meal);
  } else {
    meals.push(newMeal);
  }

  saveData(storageKeys.meals, meals);
  renderMeals();
  renderCalendar();
  document.querySelector('#meal-dialog').close();
}

// -------------------- Calendar functions --------------------
function renderCalendar() {
  const calendarBody = document.querySelector('#calendar-body');

  if (!calendarBody) {
    updateTodayMeals();
    return;
  }

  const mealOptions = meals.map((meal) => {
    return `<option value="${meal.name}">${meal.name} (${meal.type})</option>`;
  }).join('');

  calendarBody.innerHTML = days.map((day) => {
    const inputs = mealTypes.map((type) => {
      const savedMeal = calendar[day][type] || '';
      return `<td><input class="calendar-input" list="meal-options" data-day="${day}" data-type="${type}" value="${savedMeal}" placeholder="Choose or type"></td>`;
    }).join('');

    return `<tr><td>${day}</td>${inputs}</tr>`;
  }).join('');

  calendarBody.innerHTML += `<datalist id="meal-options">${mealOptions}</datalist>`;
  updateTodayMeals();
}

function updateTodayMeals() {
  const todayName = document.querySelector('#today-name');
  const todayMeals = document.querySelector('#today-meals');

  if (!todayName || !todayMeals) {
    return;
  }

  const dayNumber = new Date().getDay();
  const todayIndex = (dayNumber + 6) % 7;
  const today = days[todayIndex];
  const todayPlan = calendar[today];

  todayName.textContent = today;
  todayMeals.innerHTML = mealTypes.map((type) => {
    return `<p><strong>${type}</strong>${todayPlan[type] || 'Not planned'}</p>`;
  }).join('');
}

// -------------------- Shopping list functions --------------------
function renderShoppingList() {
  const shoppingList = document.querySelector('#shopping-list');

  if (!shoppingList) {
    return;
  }

  if (shoppingItems.length === 0) {
    shoppingList.innerHTML = '<li class="empty-message">Your shopping list is empty.</li>';
    return;
  }

  shoppingList.innerHTML = shoppingItems.map((item) => {
    const completedClass = item.completed ? 'completed' : '';
    const checked = item.completed ? 'checked' : '';

    return `
      <li class="shopping-item ${completedClass}">
        <input type="checkbox" id="shopping-${item.id}" data-toggle-shopping="${item.id}" ${checked}>
        <label for="shopping-${item.id}">${item.name}</label>
        <button class="small-button delete" type="button" data-delete-shopping="${item.id}">Delete</button>
      </li>
    `;
  }).join('');
}

// -------------------- Click events --------------------
document.addEventListener('click', (event) => {
  const categoryButton = event.target.closest('[data-category]');
  const editButton = event.target.closest('[data-edit-meal]');
  const deleteMealButton = event.target.closest('[data-delete-meal]');
  const deleteShoppingButton = event.target.closest('[data-delete-shopping]');

  if (categoryButton) {
    selectedCategory = categoryButton.dataset.category;

    document.querySelectorAll('.category-button').forEach((button) => {
      button.classList.toggle('active', button === categoryButton);
    });

    renderMeals();
  }

  if (editButton) {
    const meal = meals.find((item) => item.id === Number(editButton.dataset.editMeal));
    openMealDialog(meal);
  }

  if (deleteMealButton && confirm('Delete this meal?')) {
    const mealId = Number(deleteMealButton.dataset.deleteMeal);
    meals = meals.filter((meal) => meal.id !== mealId);
    saveData(storageKeys.meals, meals);
    renderMeals();
    renderCalendar();
  }

  if (deleteShoppingButton) {
    const itemId = Number(deleteShoppingButton.dataset.deleteShopping);
    shoppingItems = shoppingItems.filter((item) => item.id !== itemId);
    saveData(storageKeys.shopping, shoppingItems);
    renderShoppingList();
  }
});

// -------------------- Form events --------------------
const addMealButton = document.querySelector('#add-meal-button');
const closeDialogButton = document.querySelector('#close-dialog');
const cancelDialogButton = document.querySelector('#cancel-dialog');
const mealForm = document.querySelector('#meal-form');
const calendarBody = document.querySelector('#calendar-body');
const shoppingForm = document.querySelector('#shopping-form');
const shoppingList = document.querySelector('#shopping-list');
const clearShoppingButton = document.querySelector('#clear-shopping');

if (addMealButton) {
  addMealButton.addEventListener('click', () => openMealDialog(null));
}

if (closeDialogButton) {
  closeDialogButton.addEventListener('click', () => document.querySelector('#meal-dialog').close());
}

if (cancelDialogButton) {
  cancelDialogButton.addEventListener('click', () => document.querySelector('#meal-dialog').close());
}

if (mealForm) {
  mealForm.addEventListener('submit', saveMeal);
}

if (calendarBody) {
  calendarBody.addEventListener('input', (event) => {
    if (!event.target.matches('.calendar-input')) {
      return;
    }

    const day = event.target.dataset.day;
    const type = event.target.dataset.type;
    calendar[day][type] = event.target.value;
    saveData(storageKeys.calendar, calendar);
    updateTodayMeals();
  });
}

if (shoppingForm) {
  shoppingForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const input = document.querySelector('#shopping-input');
    const itemName = input.value.trim();

    if (!itemName) {
      return;
    }

    shoppingItems.push({
      id: Date.now(),
      name: itemName,
      completed: false
    });

    saveData(storageKeys.shopping, shoppingItems);
    renderShoppingList();
    input.value = '';
    input.focus();
  });
}

if (shoppingList) {
  shoppingList.addEventListener('change', (event) => {
    if (!event.target.matches('[data-toggle-shopping]')) {
      return;
    }

    const itemId = Number(event.target.dataset.toggleShopping);
    const item = shoppingItems.find((shoppingItem) => shoppingItem.id === itemId);
    item.completed = event.target.checked;
    saveData(storageKeys.shopping, shoppingItems);
    renderShoppingList();
  });
}

if (clearShoppingButton) {
  clearShoppingButton.addEventListener('click', () => {
    if (shoppingItems.length > 0 && !confirm('Clear your entire shopping list?')) {
      return;
    }

    shoppingItems = [];
    saveData(storageKeys.shopping, shoppingItems);
    renderShoppingList();
  });
}

// -------------------- Signup form --------------------
const registerForm = document.querySelector('#register-form');

if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.querySelector('#profile-name').value.trim();
    const email = document.querySelector('#profile-email').value.trim();
    const password = document.querySelector('#profile-password').value;
    const message = document.querySelector('#login-message');
    const profiles = getSavedData(storageKeys.profiles, []);
    const alreadyExists = profiles.some((profile) => profile.email === email);

    if (alreadyExists) {
      message.textContent = 'A profile with this email already exists.';
      return;
    }

    profiles.push({ name, email, password });
    saveData(storageKeys.profiles, profiles);
    message.style.color = '#2f6b4f';
    message.textContent = 'Profile created. You can now login.';
    registerForm.reset();
  });
}

// Start the page.
renderMeals();
renderCalendar();
renderShoppingList();
