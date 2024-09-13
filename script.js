const fetchButton = document.getElementById('fetch-button');
        const clickCountSpan = document.getElementById('clickCount');
        const resultsDiv = document.getElementById('results');

        let clickCount = 0;
        let apiCallQueue = [];
        let callsInCurrentWindow = 0;
        const apiCallLimit = 5;
        const callWindowTime = 3000; // 1 second window for 5 API calls
        let lastCallWindowStart = Date.now();

        // Handle button click event
        fetchButton.addEventListener('click', () => {
            clickCount++;
            clickCountSpan.textContent = `Clicks: ${clickCount}`;
            addToQueue();

            // Reset click count every 10 seconds
            setTimeout(() => {
                clickCount = 0;
                clickCountSpan.textContent = `Clicks: ${clickCount}`;
            }, 10000);
        });

        function addToQueue() {
            const now = Date.now();
            if (now - lastCallWindowStart > callWindowTime) {
                lastCallWindowStart = now;
                callsInCurrentWindow = 0;
            }

            // If API calls in the current 1 second window are below the limit
            if (callsInCurrentWindow < apiCallLimit) {
                apiCallQueue.push(makeApiCall);
                callsInCurrentWindow++;
                processQueue();
            } else {
                // Delay excess requests for 10 seconds
                setTimeout(() => {
                    apiCallQueue.push(makeApiCall);
                    processQueue();
                }, 10000);
            }
        }

        function processQueue() {
            if (apiCallQueue.length === 0) return;

            const now = Date.now();
            if (now - lastCallWindowStart >= callWindowTime) {
                // Reset window after 1 second and process more calls
                callsInCurrentWindow = 0;
                lastCallWindowStart = now;
            }

            // Process up to 5 API calls in the current 1-second window
            if (callsInCurrentWindow < apiCallLimit && apiCallQueue.length > 0) {
                for (let i = 0; i < Math.min(apiCallQueue.length, apiCallLimit - callsInCurrentWindow); i++) {
                    apiCallQueue.shift()(); // Call the function from the queue
                    callsInCurrentWindow++;
                }
            }

            // Keep checking the queue every second
            if (apiCallQueue.length > 0) {
                setTimeout(processQueue, callWindowTime); // Check the queue every 1 second
            }
        }

        async function makeApiCall() {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
                const data = await response.json();
                displayData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        function displayData(data) {
            const todoItem = document.createElement('div');
            todoItem.classList.add('todo-item');
            todoItem.innerHTML = `
                <p><strong>ID:</strong> ${data.id}</p>
                <p><strong>Title:</strong> ${data.title}</p>
                <p><strong>Completed:</strong> ${data.completed}</p>
            `;
            resultsDiv.appendChild(todoItem);
        }