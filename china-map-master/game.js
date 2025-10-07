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

        // =========================================================================
        // 新增：弹幕生成逻辑
        // =========================================================================
        const danmakuContainer = document.getElementById('danmaku-container');
        if (danmakuContainer) {
            const danmakuTexts = [
                "为祖国点亮地图！", "不忘初心", "牢记使命", "爱我中华", "繁荣昌盛", "国泰民安",
                "红色精神", "砥砺前行", "百年征程", "星火燎原", "伟大复兴", "万众一心",
                "团结奋斗", "历史是最好的教科书", "中国梦", "继往开来","民主科学", "解放全华北", 
                "打破神话", "伟大实践", "工业崛起", "改革先声", "扭转战局", "和平解放", "祖国统一", 
                "创建人民军队", "农村改革序幕", "改革开放试验田", "枪杆子里出政权", "一国两制的伟大构想", 
                "结束不能造车的历史", "打响武装反抗第一枪", "台湾是中国不可分割的一部分","铁人精神"
            ];
            const danmakuColors = [
                'rgba(192, 57, 43, 0.5)',  // 浅红色
                'rgba(197, 162, 101, 0.6)', // 浅金色
                'rgba(169, 169, 169, 0.5)'  // 浅灰色
            ];
            const totalDanmaku = 50; // 生成的弹幕总数

            for (let i = 0; i < totalDanmaku; i++) {
                const danmaku = document.createElement('div');
                danmaku.classList.add('danmaku-item');

                // 随机化属性
                danmaku.textContent = danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)];
                danmaku.style.color = danmakuColors[Math.floor(Math.random() * danmakuColors.length)];
                danmaku.style.top = `${Math.random() * 90 + 5}%`; // 随机垂直位置
                danmaku.style.fontSize = `${Math.random() * 10 + 14}px`; // 14px到24px的随机字号
                
                // 随机化速度和初始延迟
                danmaku.style.animationDuration = `${Math.random() * 10 + 15}s`; // 15到25秒的飞行时间
                danmaku.style.animationDelay = `${Math.random() * 20}s`; // 0到20秒的随机延迟出现

                danmakuContainer.appendChild(danmaku);
            }
        }

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
            default: '#CECECE', hover: '#f0ad4e', lit: '#ffdf34', litHover: '#ebb563'
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
                feedbackTextEl.style.color = '#f0ad4e';
                lightUpProvince(provinceName); 
                
                setTimeout(() => {
                    questionModal.style.display = 'none';
                    showKnowledge(provinceName);
                }, 400);
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