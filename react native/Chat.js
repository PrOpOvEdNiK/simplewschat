import React, {Component} from 'react';
import {StyleSheet, View, Text, FlatList, TextInput, Button} from 'react-native';

export default class Chat extends Component {
    constructor(props) {
        super();

        this.state = {
            message: '',
            name: '',
            isLogin: false,
            chat: []
        };
    }

    socket = {};

    doLogin = () => {
        const wsURL = "ws:/192.168.1.139/ws?userName=" + this.state.name;
        this.socket = new WebSocket(wsURL);

        this.socket.onopen = event => {
            console.log("[open] Соединение установлено");
        };

        this.socket.onclose = event => {
            if (event.wasClean) {
                console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
            } else {
                // например, сервер убил процесс или сеть недоступна
                // обычно в этом случае event.code 1006
                console.log(`[close] Соединение прервано, код=${event.code}`);
            }
        };

        this.socket.onerror = event => {
            console.log(`[error] ${error.message}`);
        };

        this.socket.onmessage = event => {
            const data = JSON.parse(event.data);
            // console.log(`[message] Данные получены с сервера: ${event.data}`);

            const obDate = new Date();
            const currentDate = obDate.toLocaleDateString();
            const currentTime = obDate.toLocaleTimeString();
            const sTime = `[${currentDate} ${currentTime}] `;

            let messages = this.state.chat;
            const id = messages.length.toString();
            let message = {
                id: id,
                type: '',
                text: ''
            };
            switch (data['action']) {
                case "Ping":
                    this.socket.send(JSON.stringify({"action": "Pong"}));
                    break;
                case "PublicMessage":
                    message.type = 'public';
                    message.text = `${sTime} ${data['userName']}: ${data['text']}`;
                    break;
                case "ConnectionLost":
                    message.type = "system";
                    message.text = `${sTime} ${data['userName']} отвалился :(`;
                    break;
                case "Connected":
                    message.type = "system";
                    message.text = `${sTime} ${data['userName']} вошел в чат`;
                    break;
                case "Disconnected":
                    message.type = "system";
                    message.text = `${sTime} ${data['userName']} покинул чат`;
                    break;
            }

            if (message.text) {
                messages.push(message);
                this.setState({chat: messages});
            }
        };

        this.setState({isLogin: true});
    };

    sendMessage = () => {
        const messageData = {
            text: this.state.message
        };

        this.socket.send(JSON.stringify(messageData));
        this.setState({message: ''});
    };

    renderLogin() {
        return <View>
            <TextInput
                style={styles.input}
                placeholder="Введите имя"
                onChangeText={(text) => this.setState({name: text})}
                value={this.state.name}
            />
            <Button
                onPress={this.doLogin}
                title="Send"
                color="#00ff00"
            />
        </View>
    }

    renderChat() {
        return <View style={styles.container}>
            <FlatList
                style={styles.chat}
                data={this.state.chat}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                    <Text item={item}>{item.text}</Text>
                )}
                ListEmptyComponent={<Text>Сообщений нет</Text>}
            />

            <View>
                <TextInput
                    style={styles.input}
                    placeholder="Сообщение"
                    onChangeText={(text) => this.setState({message: text})}
                    value={this.state.message}
                />
                <Button
                    onPress={this.sendMessage}
                    title="Send"
                    color="#00ff00"
                />
            </View>
        </View>;
    }

    render() {
        return (this.state.isLogin ? this.renderChat() : this.renderLogin());
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 4
    },
    chat: {
        height: 200,
        borderWidth: 1,
        borderColor: '#000',
        padding: 4,
        marginBottom: 24
    },
    input: {
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 4
    }
});