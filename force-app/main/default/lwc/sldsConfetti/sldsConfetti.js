/**
 * Created by trakers on 26.02.21.
 */

import { LightningElement,api, wire } from "lwc";
import CONFETTI_JS from '@salesforce/resourceUrl/confetti';
import { loadScript } from 'lightning/platformResourceLoader';
import { getRecord } from "lightning/uiRecordApi";
import {confetti_models} from './models.js';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';

export default class SldsConfetti extends LightningElement {
  @api recordId;
  @api objectApiName;

  @api fieldName = 'test';
  @api fieldValue;
  @api confettiMode;
  @api isProduction;

  _fieldToTrack = null;
  _previousValue = null;

  _trackedValue = 'TEST';
  _inLayoutEditor = false;

  @api isPlatformEventEnabled;
  @api channelFilter;
  @api channel;
  channelName = '/event/Confetti__e';
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

  /** Event Handler **/
  handleManualFire = () => {
    this.executeConfetti();
  }

  handleConfettiModeChange = (event) => {
    this.confettiMode = event.currentTarget.value;
  }

  /** Methods **/


  process = (record) => {
    let currentValue = `${record.fields[this.fieldName].value}`;
    this._trackedValue = currentValue;
    if(this._previousValue != null && currentValue == this.fieldValue){
      this.executeConfetti();
    }

    // Track old value
    this._previousValue = currentValue;

  }

  executeConfetti = () => {
    (confetti_models.hasOwnProperty(this.confettiMode)?confetti_models[this.confettiMode]:confetti_models["default"])();
  }

  /** Platform Event listener **/


  messageHandler = (res) => {
    let _res = JSON.parse(JSON.stringify(res));
    console.log('response',_res);
    if(_res.data.payload.channel__c == this.channelFilter && this.channelFilter != null){
      this.executeConfetti();
    }
  }


  registerPlatformEventListener(){
    subscribe(this.channelName, -1,this.messageHandler).then(response => {
      console.log('Subscription request sent to: ', JSON.stringify(response.channel));

      this.subscription = response;
    });

    onError(error => {
      console.log('Received error from server: ', JSON.stringify(error));
      // Error contains the server-side error
    });
  }


}