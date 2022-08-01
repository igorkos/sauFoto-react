import {Linking, Platform} from "react-native";
// @ts-ignore
import qs from 'qs';

const APP_STORE_LINK_IOS = 'https://akello.com'
const APP_STORE_LINK_ANDROID = 'https://akello.com'

export const sendEmail = async () => {
    let url = `mailto:saufotoapp@gmail.com`;

    // Create email link query
    await Linking.openURL(url);
}

export const shareEmail = async (to:string | null) => {
    if(to !== null) {
        const email = to.trim()

        let url = `mailto:${email}`;

        // Create email link query
        const query = qs.stringify({
            subject: 'Please look on this app',
            body: Platform.OS === 'ios' ? APP_STORE_LINK_IOS:APP_STORE_LINK_ANDROID,
        });

        if (query.length) {
            url += `?${query}`;
        }

        await Linking.openURL(url);
    }
}

export const shareSMS = async (phone:string | null) => {
    if(phone !== null) {
        const operator = Platform.select({ios: '&', android: '?'});
        const to = phone.trim()
        const query = qs.stringify({
            body: ('Look on this great app ' + (Platform.OS === 'ios' ? APP_STORE_LINK_IOS:APP_STORE_LINK_ANDROID)),
        });
        await Linking.openURL(`sms:${to}${operator}${query}`)
    }
}

export const openAppStore = () => {
    let link: string
    if(Platform.OS === 'ios') {
        link = 'itms-apps://apps.apple.com/tr/app/times-tables-lets-learn/id1055437768?l=tr';

    } else {
        link = "market://details?id=com.akellolcc.saufoto"
    }
    Linking.canOpenURL(link).then(
        (supported) => {
            supported && Linking.openURL(link);
        },
        (err) => console.log(err)
    );
}
