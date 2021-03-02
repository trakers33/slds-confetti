# Salesforce : SLDS Confetti

Always wanted to display some confetti like salesforce standard ?
We now have a simple solution reusable including multiple features:
- Multiple confetti types
- Trigger on field value change or Platform Event
- Compatible with emojis 😀❤️🔥
## Lightning Web Component - Record Page (for admins)

    todo: Add screenshot or video for admins

## Lightning Web Component - Code for Aura

```html
        <c:sldsConfetti 
              recordId="{!v.recordId}" 
              isProduction="true" 
              confettiMode="default"
              channelMode="recordId">
        </c:sldsConfetti>

```

## Lightning Web Component - Code for LWC
#### Emoji
```html
        <c-slds-confetti 
              record-Id={recordId}
              fieldName="Status"
              fieldValue="Closed"
              confetti-mode="emoji"
              emoji="🔥"
              is-production>
        </c-slds-confetti>
```
#### Firework
```html
        <c-slds-confetti 
              record-Id={recordId}
              fieldName="Status"
              fieldValue="Closed"
              confetti-mode="firework"
              is-production>
        </c-slds-confetti>
```

## Platform event - Trigger confetti manually
#### LWC
```html
        <c-slds-confetti 
              record-Id={recordId}
              confetti-mode="emoji"
              is-production
              channel-mode="recordId"
              is-platform-event-enabled>
        </c-slds-confetti>
```

#### Apex
```apex
String recordId = 'my_record_id';
EventBus.publish(new List<Confetti__e>{
        new Confetti__e(Channel__c=recordId,Emoji__c='🔥')
});
```

