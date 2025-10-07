document.addEventListener('DOMContentLoaded', function () {

    // 1. 使用 fetch API 从外部文件加载问题数据
    fetch('data/questions.json')
        .then(response => {
            // 检查请求是否成功
            if (!response.ok) {
                throw new Error('网络响应错误，无法加载 questions.json');
            }
            return response.json(); // 将响应体解析为 JSON
        })
        .then(questionsData => {
            // 当数据成功加载后，调用主函数来初始化整个游戏
            runGame(questionsData);
        })
        .catch(error => {
            // 如果加载失败，在控制台打印错误信息
            console.error('加载问题数据时出错:', error);
            // 可以在页面上显示一个错误提示
            document.getElementById('map-container').innerHTML = '<h2>加载游戏数据失败，请检查文件路径或网络连接。</h2>';
        });

    // 2. 将所有游戏逻辑封装进一个主函数
    // 这个函数只会在 questions.json 成功加载后被调用
    function runGame(questionsData) {
        
        // DOM 元素获取
        const mapContainer = document.getElementById('map-container');
        const questionModal = document.getElementById('question-modal');
        const provinceNameEl = document.getElementById('province-name');
        const questionTextEl = document.getElementById('question-text');
        const optionsContainerEl = document.getElementById('options-container');
        const feedbackTextEl = document.getElementById('feedback-text');
        const closeButton = document.getElementById('close-button');
        const knowledgeModal = document.getElementById('knowledge-modal');
        const knowledgeTitleEl = document.getElementById('knowledge-title');
        const knowledgeImageEl = document.getElementById('knowledge-image');
        const knowledgeTextEl = document.getElementById('knowledge-text');
        const knowledgeCloseButton = document.getElementById('knowledge-close-button');

        // ECharts 地图初始化和游戏逻辑
        const myChart = echarts.init(mapContainer);
        let litProvinces = [];
        const themeColors = { 
            default: '#CECECE', hover: '#f0ad4e', lit: '#e6a23c', litHover: '#ebb563'
        };

        const mapOption = {
            tooltip: { trigger: 'item', formatter: '{b}' },
            series: [{ name: '中国', type: 'map', map: 'china', roam: false,
                itemStyle: { areaColor: themeColors.default, borderColor: '#FFFFFF', borderWidth: 1 },
                emphasis: { focus: 'none', itemStyle: { areaColor: themeColors.hover } },
                label: { show: true, color: '#333', position: 'inside', fontSize: 10 },
                data: []
            }]
        };
        myChart.setOption(mapOption);
        
        myChart.on('click', (params) => {
            const provinceName = params.name;
            if (questionsData[provinceName] && !litProvinces.includes(provinceName)) {
                showQuestion(provinceName);
            }
        });

        function lightUpProvince(provinceName) {
            if (litProvinces.includes(provinceName)) return;
            litProvinces.push(provinceName);
            const currentOption = myChart.getOption();
            const newData = currentOption.series[0].data.concat({
                name: provinceName,
                itemStyle: { areaColor: themeColors.lit },
                emphasis: { focus: 'none', itemStyle: { areaColor: themeColors.litHover } }
            });
            myChart.setOption({ series: [{ data: newData }] });
        }

        function showQuestion(provinceName) {
            const data = questionsData[provinceName];
            provinceNameEl.textContent = provinceName;
            questionTextEl.textContent = data.question;
            optionsContainerEl.innerHTML = '';
            feedbackTextEl.textContent = '';
            data.options.forEach(optionText => {
                const button = document.createElement('button');
                button.textContent = optionText;
                button.onclick = () => checkAnswer(optionText, data.answer, provinceName);
                optionsContainerEl.appendChild(button);
            });
            questionModal.style.display = 'flex';
        }

        function checkAnswer(selectedOption, correctAnswer, provinceName) {
            if (selectedOption === correctAnswer) {
                feedbackTextEl.textContent = '回答正确！';
                feedbackTextEl.style.color = 'green';
                lightUpProvince(provinceName); 
                
                setTimeout(() => {
                    questionModal.style.display = 'none';
                    showKnowledge(provinceName);
                }, 800);
            } else {
                feedbackTextEl.textContent = '回答错误，请再试一次！';
                feedbackTextEl.style.color = 'red';
            }
        }

        function showKnowledge(provinceName) {
            const data = questionsData[provinceName];
            knowledgeTitleEl.textContent = `${provinceName} - 知识背景`;
            knowledgeImageEl.src = data.image;
            knowledgeTextEl.textContent = data.knowledge;
            knowledgeModal.style.display = 'flex';
        }

        closeButton.onclick = () => questionModal.style.display = 'none';
        knowledgeCloseButton.onclick = () => knowledgeModal.style.display = 'none';

        window.onclick = (event) => {
            if (event.target === questionModal) questionModal.style.display = 'none';
            if (event.target === knowledgeModal) knowledgeModal.style.display = 'none';
        };
    } // end of runGame function
});