<!-- <template>
    <div>
        <p :style="fontSize">This is App_1</p>
        <button v-on:click="increaseFontSize">Increase Font Size</button>
    </div>

    <div>
        千米 : <input type = "text" v-model = "kilometers"  @focus="currentlyActiveField = 'kilometers'">
        米 : <input type = "text" v-model = "meters" @focus="currentlyActiveField = 'meters'">
    </div>
    <p id="info"></p>
</template>



<script>
export default {
    data() {
        return {
            fontSize: 16,
            kilometers: 0,
            meters: 0,
            currentlyActiveField: ''
        }
    },
    methods: {
        increaseFontSize() {
            this.fontSize += 2;
        }
    },
    watch: {
        kilometers:function(newValue, oldValue) {
            // 判断是否是当前输入框
            if (this.currentlyActiveField === 'kilometers') {
                this.meters = newValue * 1000;
                document.getElementById ("info").innerHTML = "修改前值为: " + oldValue + "，修改后值为: " + newValue;
            }
        },
        meters : function (newValue, oldValue) {
            // 判断是否是当前输入框
            if (this.currentlyActiveField === 'meters') {
                this.kilometers = newValue/ 1000;
            }
        }
    }
}
</script> -->


<template>
    <div id="watch-example">
        <p>
            输入一个问题，以 ? 号结尾输出答案:
            <input v-model="question" />
        </p>
        <p>{{ answer }}</p>
        <button @click="say('hi')">Say hi</button>
        <button @click="say('what')">Say what</button>
        <!-- 这两个 one() 和 two() 将执行按钮点击事件 -->
        <button @click="one($event), two($event)">点我</button>

        <p>input 元素：</p>
        <input v-model="message" placeholder="编辑我……">
        <p>input 表单消息是: {{ message }}</p>
            
        <p>textarea 元素：</p>
        <textarea v-model="message2" placeholder="多行文本输入……"></textarea>
        <p>textarea 表单消息是:</p>
        <p style="white-space: pre">{{ message2 }}</p>

        <p>单个复选框：</p>
        <input type="checkbox" id="checkbox" v-model="checked">
        <label for="checkbox">{{ checked }}</label>
            
        <p>多个复选框：</p>
        <input type="checkbox" id="runoob" value="Runoob" v-model="checkedNames">
        <label for="runoob">Runoob</label>
        <input type="checkbox" id="google" value="Google" v-model="checkedNames">
        <label for="google">Google</label>
        <input type="checkbox" id="taobao" value="Taobao" v-model="checkedNames">
        <label for="taobao">taobao</label>
        <br>
        <ul>
            <li v-for="name in checkedNames" :key="name">{{ name }}</li>
        </ul>

        <select v-model="selected">
            <option v-for="option in options" :value="option.value">
                {{ option.text }}
            </option>
        </select>
        <span>选择的是: {{ selected }}</span>

        <p>页面载入时，input 元素自动获取焦点：</p>
        <input v-focus>
    </div>
</template>

<script>
export default {
    data() {
        return {
            question: '',
            answer: '',
            message: '',
            message2: '',
            checked: false,
            checkedNames: [],
            selected: 'www.runoob.com',
            options: [
                { text: 'Runoob', value: 'www.runoob.com' },
                { text: 'Google', value: 'www.google.com' },
                { text: 'Taobao', value: 'www.taobao.com' }
            ]
        }
    },
    watch: {
        // 每当问题改变时，此功能将运行，以 ? 号结尾，兼容中英文 ?
        question(newQuestion, oldQuestion) {
            if (newQuestion.indexOf('?') > -1 || newQuestion.indexOf('？') > -1) {
                this.getAnswer()
            }
        }
    },
    methods: {
        getAnswer() {
            this.answer = '加载中...'
            axios
                .get('/try/ajax/json_vuetest.php')
                .then(response => {
                this.answer = response.data.answer
            })
                .catch(error => {
                this.answer = '错误! 无法访问 API。 ' + error
            })
        },
        say(msg) {
            alert(msg)
        },
        one(event) {
            alert("第一个事件处理器逻辑...")
        },
        two(event) {
            alert("第二个事件处理器逻辑...")
        }
    },
    directives: {
        focus: {
            // 指令的定义
            mounted(el) {
                el.focus()
            }
        }
   }
}
</script>