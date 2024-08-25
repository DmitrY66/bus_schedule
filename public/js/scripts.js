const fetchBusData = async () => {
  try {
    const response = await fetch('/next-departure');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // const buses = response.json();

    return response.json();
  } catch (error) {
    console.error(`Error fetching bus data: ${error}`);

  }
};

// форматирует дату
const formatDate = (date) => date.toISOString().split('T')[0];
// форматирует время
const formatTime = (date) => date.toTimeString().split(' ')[0].slice(0, 5);

// вычисляем время до "отправляется"
const getTimeRemainingSeconds = (departureTime) => {
  const now = new Date();
  const timeDifference = departureTime - now;
  return Math.floor(timeDifference / 1000);
};

const renderBusData = (buses) => {
  const tableBody = document.querySelector('#bus tbody');

  tableBody.textContent = '';

  buses.forEach(bus => {
    const row = document.createElement('tr');

    const nextDepartureDateTimeUTC = new Date(
      `${bus.nextDeparture.date}T${bus.nextDeparture.time}Z`
    );

    const remainingSeconds = getTimeRemainingSeconds(nextDepartureDateTimeUTC);
    const remainingTimeText = remainingSeconds < 60 ? 'Отправляется' : bus.nextDeparture.remaining;

    row.innerHTML = `
    <td>${bus.busNumber}</td>
    <td>${bus.startPoint} - ${bus.endPoint}</td>
    <td>${formatDate(nextDepartureDateTimeUTC)}</td>
    <td>${formatTime(nextDepartureDateTimeUTC)}</td>
    <td>${remainingTimeText}</td>
    `;

    tableBody.append(row);
  })
};

const initWebSocket = () => {
  const ws = new WebSocket(`ws://${location.host}`);

  ws.addEventListener('open', () => {
    console.log('WebSocket connection');
  });

  ws.addEventListener('message', (event) => {
    const buses = JSON.parse(event.data);
    renderBusData(buses);
  });

  ws.addEventListener('error', (error) => {
    console.log(`WebSocket connection: ${error}`);
  });

  ws.addEventListener('close', () => {
    console.log(`WebSocket connection stop!`);
  });
};

// обновляет текущее время
const updateTime = () => {
  const currentTimeElement = document.getElementById('current-time');
  const now = new Date();
  currentTimeElement.textContent = now.toTimeString().split(' ')[0];

  setTimeout(updateTime, 2000)
};

const init = async () => {
  updateTime();

  const buses = await fetchBusData();
  renderBusData(buses);

  initWebSocket();
};

init();





