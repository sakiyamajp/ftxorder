# ftx order

使用は自己責任でお願いします。

![sample](https://github.com/sakiyamajp/ftxorder/blob/master/sample.png?raw=true)

1クリックでオーダー出したいのツール。

# requirements
install LTS node.js 

https://nodejs.org/en/

nodejs ^14.15.0 で確認しています。

# install

```
npm install
```

windowsでエラーが出る場合は

```
npm install -g windows-build-tools
```
参考 : https://arm-network.com/blockchain/windows-build-tools/

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
各コマンドはwindowsならコマンドプロンプトからmac linuxならターミナルからこのプロジェクトフォルダに移動し行ってください。
```
npm start
```
参考 : 
https://qiita.com/KOJI-YAMAMOTO/items/4d189b2e44b5ffe5827a

# access
"localhost:8081"をchromeで開いてください。
portはconfigで変更できます。

# たぶん使いにくいところ
sub account移動ができない。

trigger orderがない。

PERPしかない

実験ということで　おなしゃす！

