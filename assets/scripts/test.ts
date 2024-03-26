import { _decorator, Component, Label, Node } from 'cc';
import { DiscordBridge } from '../libs/DiscordSDK/discordBridge';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {
    
    @property(Label)
    statusLabel: Label;

    start () {
        DiscordBridge.Instance.events.on('sdkReady', async () => {
            this.statusLabel.string = await DiscordBridge.Instance.getActivityChannelName();
        }, this);
    }
}


