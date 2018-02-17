'use strict';
//Item Controller for local data
const CtrlItem = (() => {
  //meal constructor
  const Meal = function (id, name, calories) {
    this.id = id;
    this.name = name;
    this.calories = calories;
  }

  //methods to interact with Local Storage - must be declared before any method to use it inside IIFE !!or use function(){}
  const addData = (item) => {
    const items = getData();
    items.push(item);
    write(items);
  }
  const removeData = (id) => {
    const items = getData();
    items.forEach((item, index) => {//remove meal from the array
      if (item.id === id) {
        items.splice(index, 1);
      }
    })
    write(items);
  }
  const updateData = (id, name, calories) => {
    const items = getData();
    items.forEach((item) => {//remove meal from the array
      if (item.id === id) {
        item.id = id;
        item.name = name;
        item.calories = calories;
      }
    })
    write(items);
  }
  const getData = () => {
    const data = localStorage.getItem('meals');
    return JSON.parse(data) || [];
  }
  const write = (meals) => {
    localStorage.setItem('meals', JSON.stringify(meals));
  }
  //Data Structure - state
  const data = {
    items: getData(),
    currentItem: null,
  }

  //public methods in return
  return {
    getState: () => {
      data.items = getData();
      //JSON.parse(JSON.stringify(obj)) is a way to deep copy a obj's variables but not methods
      return JSON.parse(JSON.stringify(data))
    },
    addMeal: (name, calories) => {
      const id = Date.now();
      const mealTmp = new Meal(id, name, calories);
      addData(mealTmp);
    },
    removeMeal: (id) => {
      removeData(id);
      data.currentItem = null;
    },
    updateMeal: (id, name, calories) => {
      updateData(id, name, calories);
      data.currentItem = null;
    },
    toEditItem: (id) => {
      const meals = data.items;
      const meal = meals.find((meal) => {
        return meal.id == id;
      })
      data.currentItem = meal;
    },
    cancelEditItem: () => {
      data.currentItem = null;
    },
    clearAllMeals: () => {
      localStorage.clear();
    }
  }
})();

//UI Controller
const CtrlUI = (() => {
  //PRIVATE VARIABLES
  const UISelector = {
    itemList: document.querySelector('#item-list'),
    btnAdd: document.querySelector('.add-btn'),
    btnUpdate: document.querySelector('.update-btn'),
    btnDelete: document.querySelector('.delete-btn'),
    btnBack: document.querySelector('.back-btn'),
    btnClear: document.querySelector('.clear-btn'),
    inputMeal: document.querySelector('#item-name'),
    inputCalories: document.querySelector('#item-calories'),
    totalCal: document.querySelector('.total-calories'),
    instruction: document.querySelector('.card-title')
  }

  //PRIVATE METHODS
  //create ul
  const createUl = (items) => {
    let html = '';
    items.forEach((item) => {
      html += `<li class="collection-item" id="item-${item.id}">
      <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
      <a href="#" class="secondary-content">
        <i class="edit-item fa fa-pencil"></i>
      </a>
    </li>`;
    })
    return html;
  }
  //calculate total calories from items
  const calculateTotal = (items) => {
    const arrCal = items.map(item => item.calories);
    return arrCal.length === 0 ? 0 : arrCal.reduce((total, current) => total + current);
  }

  //render components
  const renderItems = (state) => {
    const ul = createUl(state.items);
    UISelector.itemList.innerHTML = ul;
  }

  const renderTotal = (state) => {
    const total = calculateTotal(state.items);
    UISelector.totalCal.innerHTML = total;
  }

  const renderBtns = (state) => {
    if (state.currentItem !== null) {
      UISelector.btnAdd.style.display = 'none';
      UISelector.btnUpdate.style.display = 'inline-block';
      UISelector.btnDelete.style.display = 'inline-block';
      UISelector.btnBack.style.display = 'inline-block';
    } else {
      UISelector.btnAdd.style.display = 'inline-block';
      UISelector.btnUpdate.style.display = 'none';
      UISelector.btnDelete.style.display = 'none';
      UISelector.btnBack.style.display = 'none';
    }
  }

  const renderInputs = (state) => {
    const meal = state.currentItem;
    if (meal !== null) {
      UISelector.inputMeal.value = meal.name
      UISelector.inputCalories.value = meal.calories
      UISelector.instruction.textContent = 'Edit/Delete Item'
    } else {
      UISelector.instruction.textContent = 'Add Meal / Food Item'
    }
    UISelector.inputMeal.focus();
  }

  //PUBLIC METHODS
  return {
    renderUI: (state) => {
      renderItems(state);
      renderTotal(state);
      renderBtns(state);
      renderInputs(state);
    },
    getInput: () => {
      if (UISelector.inputMeal.value === '' || isNaN(UISelector.inputCalories.value)) return null;
      return {
        name: UISelector.inputMeal.value,
        calories: parseInt(UISelector.inputCalories.value)
      }
    },
    getCurrentItemId: function (e) {
      if (e.target.classList.contains('edit-item')) {
        const target = e.target.parentElement.parentElement;
        return target.id.substr(5);
      };
    },
    clearInput: () => {
      UISelector.inputMeal.value = '';
      UISelector.inputCalories.value = ''
    },
    getUiSelector: () => UISelector
  }
})();

//Main app controller
const App = ((CtrlItem, CtrlUI) => {
  //PRIVATE METHODS:
  //sync ui with local storage
  const syncData = () => {
    //get state info from CtrlItem
    const state = CtrlItem.getState();
    //state.currentItem = { id: 123234098395, name: 'Sweet and Sour Pork', calories: 938 }
    CtrlUI.renderUI(state);
  }

  //bind events
  const eventBinding = () => {
    const uiSelector = CtrlUI.getUiSelector();
    //event action: add new item
    uiSelector.btnAdd.addEventListener('click', addItem);
    //event action: get item from edit button
    uiSelector.itemList.addEventListener('click', getCurrentItem);
    //event action: cancel editing an item
    uiSelector.btnBack.addEventListener('click', cancelEdit)
    //event action: update meal
    uiSelector.btnUpdate.addEventListener('click', updateItem)
    //event action: delete meal
    uiSelector.btnDelete.addEventListener('click', deleteItem)
    //event action: clear all meals
    uiSelector.btnClear.addEventListener('click', clearItems)

  }

  //event action: add new item
  const addItem = function (e) {
    const meal = CtrlUI.getInput();
    if (meal != null) CtrlItem.addMeal(meal.name, meal.calories);
    CtrlUI.clearInput();
    syncData();
    e.preventDefault();
  }
  //event action: get item from edit button
  const getCurrentItem = (e) => {
    const mealId = CtrlUI.getCurrentItemId(e);
    if (mealId === undefined) return;
    CtrlItem.toEditItem(mealId);
    syncData();
    e.preventDefault();
  }
  //event action: cancel editing an item
  const cancelEdit = () => {
    CtrlItem.cancelEditItem();
    CtrlUI.clearInput();
    syncData();
    e.preventDefault();
  }
  //event action: update meal
  const updateItem = (e) => {
    const input = CtrlUI.getInput();
    const currentItem = CtrlItem.getState().currentItem;
    CtrlItem.updateMeal(currentItem.id, input.name, input.calories);
    CtrlUI.clearInput();
    syncData();
    e.preventDefault();
  }
  //event action: delete meal
  const deleteItem = (e) => {
    const currentItem = CtrlItem.getState().currentItem;
    CtrlItem.removeMeal(currentItem.id);
    CtrlUI.clearInput();
    syncData();
    e.preventDefault();
  }
  //event action: clear all meals 
  const clearItems = () => {
    CtrlItem.clearAllMeals();
    CtrlUI.clearInput();
    syncData();
    e.preventDefault();
  }

  //public methods in return
  return {
    init: () => {
      console.log('Initializing app...');
      //bind events
      eventBinding();
      //sync ui with local storage
      syncData();
    }
  }
})(CtrlItem, CtrlUI);

App.init();


