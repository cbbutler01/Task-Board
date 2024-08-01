// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

function daysBetween(date1, date2) {
  const diffTime = (new Date(date2) - new Date(date1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(taskList));
    localStorage.setItem('nextId', JSON.stringify(nextId));
};

// Create a function to generate a unique task id
function generateTaskId() {
    return `task-${nextId++}`;
};

// Create a function to create a task card
function createTaskCard(task) {
  const card = $('<div>')
      .addClass('card task-card draggable my-3')
      .attr('data-task-id', task.id);
  
  // Determine color based on due date
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  const daysUntilDue = daysBetween(today, dueDate);
  let cardClass = '';

  if (daysUntilDue < 0) {
      cardClass = 'bg-danger'; // Past due
  } else if (daysUntilDue <= 1) {
      cardClass = 'bg-warning'; // Due soon
  } else {
      cardClass = 'bg-success'; // Due later
  }

  card.addClass(cardClass);

  const title = $('<div>').addClass('card-header h4').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const description = $('<p>').addClass('card-text').text(task.description);
  const dueDateText = $('<p>').addClass('card-text').text(task.dueDate);
  const deleteBtn = $('<button>')
      .addClass('btn btn-danger delete')
      .text('Delete')
      .attr('data-task-id', task.id);
  deleteBtn.on('click', handleDeleteTask);

  cardBody.append(description, dueDateText, deleteBtn);
  card.append(title, cardBody);
  return card;
}


// Create a function to render the task list and make cards draggable
function renderTaskList() {
    const toDoCards =  $('#todo-cards');
    toDoCards.empty();

    const inProgressCards = $('#in-progress-cards');
    inProgressCards.empty();

    const doneCards = $('#done-cards');
    doneCards.empty();

    for (let task of taskList){
        if (task.status === 'to-do') {
            toDoCards.append(createTaskCard(task));
          } else if (task.status === 'in-progress') {
            inProgressCards.append(createTaskCard(task));
          } else if (task.status === 'done') {
            doneCards.append(createTaskCard(task));
          }
    };

    // Make cards draggable
    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
        helper: function (e) {
          // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
          const original = $(e.target).hasClass('ui-draggable')
            ? $(e.target)
            : $(e.target).closest('.ui-draggable');
          // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
          return original.clone().css({
            width: original.outerWidth(),
          });
        },
      });
}

// Create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const title = $('#taskTitle').val().trim();
    const dueDate = $('#datePicker').val();
    const description = $('#taskDescription').val().trim();
    const id = generateTaskId();

    const newTask = { id, title, description, dueDate, status: 'to-do' };
    taskList.push(newTask);
    saveToLocalStorage();
    renderTaskList();

    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('datePicker').value = '';
}

// Create a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.task-card').data('task-id');
    taskList = taskList.filter(task => task.id !== taskId);
    saveToLocalStorage();
    renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable[0].dataset.taskId;
    const newStatus = event.target.id;
    for (let task of taskList) {
        if (task.id === taskId) {
            task.status = newStatus;
        }
    }
    saveToLocalStorage();
    renderTaskList();
};

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#taskForm').on('submit', handleAddTask);

    $('#datePicker').datepicker({
        dateFormat: 'yy-mm-dd'
    });
    $('.lane').droppable({
        accept: ".draggable",
        drop: handleDrop
    });
});
