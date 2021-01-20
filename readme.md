# ftx order

使用は自己責任でお願いします。

![sample](https://github.com/sakiyamajp/ftxorder/blob/master/sample.png?raw=true)

# requirements
install LTS node.js 

https://nodejs.org/en/



# install

```
npm install
```

# config
1. _config.jsをconfig.jsに名前変更
2. config.jsの内容を自身のものに変更してください。
```
export default {
	subaccount : "enter ftx sub account name",
	key : "enter ftx api key",
	secret : "enter ftx api secret",
	port : 8081
}
```
# start
```
npm start
```
# access
"localhost:8081"をchromeで開いてください。
portはconfigで変更できます。

