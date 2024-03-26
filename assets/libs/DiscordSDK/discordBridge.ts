import { _decorator, Component, director, Label, Node, EventTarget } from 'cc';
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { DISCORD_ACTIVITY_URL, DISCORD_CLIENT_ID } from '../../scripts/consts';
const { ccclass, property } = _decorator;


@ccclass('discordBridge')
export class DiscordBridge extends Component {
    
    static Instance: DiscordBridge;

    discordSdk: DiscordSDK;
    events = new EventTarget();
    auth: any;

    async getActivityChannelName() {
        let activityChannelName = 'Unknown';
        if (this.discordSdk.channelId != null && this.discordSdk.guildId != null) {
            const channel = await this.discordSdk.commands.getChannel({ channel_id: this.discordSdk.channelId });
            if (channel.name != null) {
                activityChannelName = channel.name;
            }
        }
        return activityChannelName;
    }

    onEnable(){
        DiscordBridge.Instance = this;
    }

    start() {
        director.addPersistRootNode(this.node);
        let discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
        this.discordSdk = discordSdk;
        this.setupDiscordSdk().then(async () => {
            this.events.emit('sdkReady');
        });

    }

    async setupDiscordSdk() {
        await this.discordSdk.ready();
        const { code } = await this.discordSdk.commands.authorize({
            client_id: DISCORD_CLIENT_ID,
            response_type: "code",
            state: "",
            prompt: "none",
            scope: [
                "identify",
                "guilds",
            ],
        });

        const response = await fetch(DISCORD_ACTIVITY_URL + "/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
            }),
        });
        const { access_token } = await response.json();

        this.auth = await this.discordSdk.commands.authenticate({
            access_token,
        });

        if (this.auth == null) {
            throw new Error("Authenticate command failed");
        }
    }
}


