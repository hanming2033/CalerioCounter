'use strict';
//Item Controller for local data
const CtrlItem = (() => {
  //meal constructor
  const meal = function (id, name, calories) {
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
    setCurrent: (id) => data.currentItem = id,
    addMeal: (name, calories) => {
      const id = Date.now();
      const mealTmp = new meal(id, name, calories);
      addData(mealTmp);
    },
    removeMeal: (id) => {
      removeData(id);
    },
    updateMeal: (id, name, calories) => {
      updateData(id, name, calories);
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
    inputMeal: document.querySelector('#item-name'),
    inputCalories: document.querySelector('#item-calories'),
    totalCal: document.querySelector('.total-calories')
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
    }  else {
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
    }
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
    console.log(state.currentItem);
    state.currentItem = {id: 123234098395, name: 'Sweet and Sour Pork', calories: 938}
    console.log(state.currentItem);
    CtrlUI.renderUI(state);
  }

  //bind events
  const eventBinding = () => {
    const uiSelector = CtrlUI.getUiSelector();
    uiSelector.btnAdd.addEventListener('click', addItem);
  }

  //event action: add new item
  const addItem = function (e) {
    const meal = CtrlUI.getInput();
    if (meal != null) CtrlItem.addMeal(meal.name, meal.calories);
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


