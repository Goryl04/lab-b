class Todo {
  constructor() {
    const savedData = localStorage.getItem('todo_tasks');
    this.tasks = savedData ? JSON.parse(savedData) : [];
    this.term = "";
    this.draw();
  }

  save(){
    localStorage.setItem('todo_tasks', JSON.stringify(this.tasks));
  }

  add(name, date){
    if(name.length < 3 || name.length > 255){
      alert("Nazwa zadania musi mieć od 3 do 255 znaków.");
      return;
    }

    if(date){
      const taskdate = new Date(date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if(taskdate < today){
        alert("Data zadania nie może być wcześniejsza niż dzisiaj.");
        return;
      }
    }

    const newTask = {
      id: Date.now(),
      name: name,
      date: date,
      completed: false
    };

    this.tasks.push(newTask);
    this.save();
    this.draw();
  }

  remove(id){
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.save();
    this.draw();
  }

  update(id, newName, newDate){
    const task = this.tasks.find(t => t.id === id);
    if(task){
      if (newName.length >= 3 && newName.length <= 255) {
        task.name = newName;
      }
      task.date = newDate;
      this.save();
      this.draw();
    }
  }

  toggleComplete(id){
    const task = this.tasks.find(t => t.id === id);
    if(task){
      task.completed = !task.completed;
      this.save();
      this.draw();
    }
  }

  get filteredTasks(){
    if(this.term.length < 2) return this.tasks;
    return this.tasks.filter(task => task.name.toLowerCase().includes(this.term.toLowerCase()));
  }

  highlight(text){
    if(this.term.length < 2) return text;
    const regex = new RegExp(`(${this.term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  draw(){
    const container = document.querySelector('.tasks_container');
    container.innerHTML = "";
    const tasksToRender = this.filteredTasks;
    tasksToRender.forEach(task =>{
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.onchange = () => this.toggleComplete(task.id);

      const nameEl = document.createElement('div');
      nameEl.innerHTML = this.highlight(task.name);
      nameEl.className = task.completed ? 'completed clickable' : 'clickable';

      const dateEl = document.createElement('div');
      dateEl.innerText = task.date;
      dateEl.className = task.completed ? 'completed clickable' : 'clickable';

      const deleteBtn = document.createElement('button');
      deleteBtn.innerText = '🗑️ Usuń';
      deleteBtn.className = 'btn-small delete-btn';
      deleteBtn.onclick = () => this.remove(task.id);

      const enableNameEdit = () => {
        if (task.completed) return;

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = task.name;

        nameInput.onblur = () => {
          this.update(task.id, nameInput.value, task.date);
        };
        container.replaceChild(nameInput, nameEl);
        nameInput.focus();
      };

      const enableDateEdit = () => {
        if (task.completed) return;

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = task.date;

        dateInput.onblur = () => {
          this.update(task.id, task.name, dateInput.value);
        };
        container.replaceChild(dateInput, dateEl);
        dateInput.focus();
      };

      nameEl.onclick = enableNameEdit;
      dateEl.onclick = enableDateEdit;

      container.appendChild(checkbox);
      container.appendChild(nameEl);
      container.appendChild(dateEl);
      container.appendChild(deleteBtn);
    });
  }
}

const app = new Todo();
document.todo = app;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add_task').addEventListener('click', () => {
    const nameInput = document.getElementById('input_task');
    const dateInput = document.getElementById('input_date');

    app.add(nameInput.value, dateInput.value);
    nameInput.value = '';
    dateInput.value = '';
  });

  document.getElementById('search_bar').addEventListener('input', (event) => {
    app.term = event.target.value;
    app.draw();
  });
});

