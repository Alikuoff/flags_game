let countries = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft;
let playerName = '';
let gameHistory = [];

async function fetchCountries() {
    try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        countries = response.data.filter(country => 
            country.flags && 
            country.flags.png && 
            country.capital && 
            country.capital.length > 0
        );
    } catch (error) {
        console.error('Error fetching countries:', error);
        document.getElementById('question').textContent = 'Ma\'lumotlarni yuklashda xatolik yuz berdi';
    }
}

function startGame() {
    playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Iltimos ismingizni kiriting');
        return;
    }
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    currentQuestion = 0;
    score = 0;
    gameHistory = [];
    document.getElementById('score').textContent = '0';
    document.getElementById('currentQuestion').textContent = '1';
    createQuestion();
}

function getRandomCountries(count, excludeCountry = null) {
    const availableCountries = countries.filter(country => 
        country !== excludeCountry && !gameHistory.includes(country)
    );
    const randomCountries = [];
    
    while (randomCountries.length < count && availableCountries.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCountries.length);
        const country = availableCountries[randomIndex];
        if (!randomCountries.includes(country)) {
            randomCountries.push(country);
            availableCountries.splice(randomIndex, 1);
        }
    }
    
    return randomCountries;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startTimer() {
    timeLeft = 10;
    updateTimer();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        updateTimerCircle();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

function updateTimer() {
    document.getElementById('timer').textContent = timeLeft;
}

function updateTimerCircle() {
    const circle = document.getElementById('timerCircle');
    const progress = (timeLeft / 15) * 100;
    circle.style.background = `conic-gradient(
        #2F4F4F ${progress}%,
        #5f9ea0 ${progress}%
    )`;
}

function handleTimeout() {
    clearInterval(timer);
    document.getElementById('message').textContent = "Vaqt tugadi!";
    document.getElementById('nextButton').classList.remove('hidden');
    disableOptions();
    showCorrectAnswer();
}

function createQuestion() {
    const mainCountry = getRandomCountries(1)[0];
    if (!mainCountry) {
        console.error('No country available');
        return;
    }

    gameHistory.push(mainCountry);
    const otherCountries = getRandomCountries(3, mainCountry);
    const options = [...otherCountries, mainCountry];
    
    const flagImg = document.getElementById('flag');
    flagImg.src = mainCountry.flags.png;
    flagImg.onerror = () => {
        flagImg.src = 'https://via.placeholder.com/200x100?text=Flag+Not+Available';
    };
    flagImg.style.maxWidth = '50%';
    
    document.getElementById('question').textContent = `${mainCountry.name.common} davlatining poytaxti qaysi?`;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    const shuffledOptions = shuffleArray(options);
    
    shuffledOptions.forEach(country => {
        const button = document.createElement('button');
        button.className = 'w-full px-6 py-4 rounded-full bg-gray-50 text-primary text-lg font-medium text-left hover:bg-secondary hover:text-white transition-all';
        button.textContent = country.capital[0];
        button.addEventListener('click', () => checkAnswer(country.capital[0], mainCountry.capital[0]));
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('nextButton').classList.add('hidden');
    document.getElementById('message').textContent = '';
    startTimer();
}

function showCorrectAnswer() {
    const options = document.querySelectorAll('#options button');
    const correctAnswer = gameHistory[gameHistory.length - 1].capital[0];
    
    options.forEach(option => {
        if (option.textContent === correctAnswer) {
            option.classList.remove('bg-gray-50', 'hover:bg-secondary');
            option.classList.add('bg-green-500', 'text-white');
        }
    });
}

function checkAnswer(selectedAnswer, correctAnswer) {
    clearInterval(timer);
    const options = document.querySelectorAll('#options button');
    disableOptions();
    
    options.forEach(option => {
        if (option.textContent === correctAnswer) {
            option.classList.remove('bg-gray-50', 'hover:bg-secondary');
            option.classList.add('bg-green-500', 'text-white');
        } else if (option.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
            option.classList.remove('bg-gray-50', 'hover:bg-secondary');
            option.classList.add('bg-red-500', 'text-white');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        score++;
        document.getElementById('message').textContent = "To'g'ri!";
        document.getElementById('score').textContent = score;
    } else {
        document.getElementById('message').textContent = `Noto'g'ri! To'g'ri javob: ${correctAnswer}`;
    }
    
    document.getElementById('nextButton').classList.remove('hidden');
}

function disableOptions() {
    const options = document.querySelectorAll('#options button');
    options.forEach(option => {
        option.disabled = true;
        option.style.cursor = 'default';
        option.classList.remove('hover:bg-secondary', 'hover:text-white');
    });
}

function nextQuestion() {
    currentQuestion++;
    document.getElementById('currentQuestion').textContent = currentQuestion + 1;
    
    if (currentQuestion < 10) {
        createQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');
    document.getElementById('resultPlayerName').textContent = playerName;
    document.getElementById('finalScore').textContent = score;
    
    let message = '';
    if (score === 10) {
        message = 'Ajoyib! Siz barcha savollarga to\'g\'ri javob berdingiz! 🎉';
    } else if (score >= 7) {
        message = 'Juda yaxshi natija! 👏';
    } else if (score >= 5) {
        message = 'Yaxshi urinish! 👍';
    } else {
        message = 'Keyingi safar yaxshiroq natija ko\'rsatishga harakat qiling! 💪';
    }
    
    document.getElementById('resultMessage').textContent = message;
}

function restartGame() {
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('playerName').value = '';
    score = 0;
    currentQuestion = 0;
    gameHistory = [];
}

// O'yinni ishga tushirish
fetchCountries();