/**
 * Created by trakers on 26.02.21.
 */

import { LightningElement,api, wire } from "lwc";
import CONFETTI_JS from '@salesforce/resourceUrl/confetti';
import { loadScript } from 'lightning/platformResourceLoader';
import { getRecord } from "lightning/uiRecordApi";
import {confetti_models} from './models.js';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import userId from '@salesforce/user/Id';

const USER_ID   = 'userId';
const RECORD_ID = 'recordId';
const CHANNEL = '/event/Confetti__e';
const DEFAULT = 'default';

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}
function isEmptyString(s) {
  return (
    s === undefined ||
    s === null ||
    (typeof s === 'string' && s.trim() === '')
  );
}

export default class SldsConfetti extends LightningElement {
  @api recordId;
  @api objectApiName;

  @api fieldName; // fieldName to compare
  @api fieldValue; // value to be compared with
  @api confettiMode = DEFAULT;
  @api emoji;
  @api isProduction = false;

  _fieldToTrack = null;
  _previousValue = null;

  _trackedValue = 'TEST';
  _inLayoutEditor = false;

  @api isPlatformEventEnabled;
  @api channelMode = USER_ID;
  subscription = {};

  connectedCallback() {
    this._inLayoutEditor = document.location.href.indexOf('/flexipageEditor/') !== -1;

    // Register error listener
    if(this.isPlatformEventEnabled){
      this.registerPlatformEventListener();
    }

    //doInit
    loadScript(this, CONFETTI_JS)
      .then(() => {
        this._fieldToTrack = `${this.objectApiName}.${this.fieldName}`;
      })
      .catch((error) => {
        console.log("error loading confetti js " + JSON.stringify(error));
      });
  }

  disconnectedCallback() {}

  renderedCallback(){
  }


  @wire(getRecord, { recordId:'$recordId', fields:'$_fieldToTrack'})
  wireConfiguration({error,data}){
    if(data){
      this.process(data);
    }
  }

  /** Getter/setters **/

  get confettiModeList(){
    return Object.keys(confetti_models).map(key => {return { label:key, value:key, }});
  }

  get platformEventList(){
    return [{label:USER_ID,value:USER_ID},{label: RECORD_ID,value: RECORD_ID}];
  }

  get isAdminModeDisplayed(){
    console.log('this.isProduction',this.isProduction);
    console.log('this._inLayoutEditor',this._inLayoutEditor);
    return !this.isProduction && !this._inLayoutEditor;
  }

  get isCustomEmojiDisplayed(){
    return this.confettiMode == 'emoji';
  }

  /** Event Handler **/
  handleManualFire = () => {
    this.executeConfetti();
  }

  handleConfettiModeChange = (event) => {
    this.confettiMode = event.currentTarget.value;
  }

  handleChannelModeChange = (event) => {
    this.channelMode = event.currentTarget.value;
  }

  handleCEnablePlatformEventChange = (event) => {
    this.isPlatformEventEnabled = event.currentTarget.checked;
    console.log('isPlatformEventEnabled',this.isPlatformEventEnabled);
    if(this.isPlatformEventEnabled){
      this.registerPlatformEventListener();
    }
  }

  handleEmojiChange = (event) => {
    this.emoji = event.currentTarget.value;
  }

  /** Methods **/


  process = (record) => {
    let currentValue = `${record.fields[this.fieldName].value}`;
    this._trackedValue = currentValue;
    if(!isUndefinedOrNull(this._previousValue) && currentValue == this.fieldValue){
      this.executeConfetti();
    }

    // Track old value
    this._previousValue = currentValue;

  }

  executeConfetti = () => {
    (confetti_models.hasOwnProperty(this.confettiMode)?confetti_models[this.confettiMode]:confetti_models[DEFAULT])({emoji:this.emoji});
  }

  /** Platform Event listener **/


  messageHandler = (res) => {
    let _res = JSON.parse(JSON.stringify(res));
    // .substr(0,18) we use only the 18 recordIds
    let key   = _res.data.payload.Channel__c  || '';
    let emoji = _res.data.payload.Emoji__c    || null;
    console.log('messageHandler',_res.data.payload.Channel__c);
    if(!isEmptyString(_res.data.payload.Channel__c)){
      /** Emoji from PlatformEvent **/
      if(!isEmptyString(emoji)){
        this.emoji = emoji;
      }
      if(this.channelMode == USER_ID && key == userId){
        this.executeConfetti();
      }else if(this.channelMode == RECORD_ID && key == this.recordId){
        this.executeConfetti();
      }
    }
  }


  async registerPlatformEventListener(){
    console.log('registerPlatformEventListener');

    let unsubResult = await unsubscribe(this.subscription, response => {
      console.log('unsubscribe() response: ', JSON.stringify(response));
      // Response is true for successful unsubscribe
    })


    let subResult = await subscribe(CHANNEL, -1,this.messageHandler);

    this.subscription = subResult;


    onError(error => {
      console.log('Received error from server: ', JSON.stringify(error));
      // Error contains the server-side error
    });

  }


}