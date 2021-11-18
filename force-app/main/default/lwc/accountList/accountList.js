import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/accountListController.getAccountLst';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
// datatable columns
const columns = [
    {
        label: 'Name',
        fieldName: 'Name',
        type: 'text',
        sortable: true
    }, {
        label: 'Owner',
        fieldName: 'OwnerId',
        type: 'text',
        editable: true,
    }, {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'Phone',
        editable: true,
    }, {
        label: 'Website',
        fieldName: 'Website',
        type: 'text',
        editable: true
    }, {
        label: 'Annual Revenue',
        fieldName: 'AnnualRevenue',
        type: 'currency',
        editable: true
    }
];

export default class AccountList extends LightningElement {
    columns = columns;
    @track accounts;
    saveDraftValues = [];
    searchKey = '';
    @track sortBy;
    @track sortDirection;
    @wire(getAccounts,{ searchKey: '$searchKey' })
    cons(result) {
        this.accounts = result;
       
        if (result.error) {
            this.accounts = undefined;
        }
    };
    handleKeyChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.searchKey = searchKey;
        }, 300);
    }
    handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        // Updateing the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.saveDraftValues = [];
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }

    handleSortAccountData(event) {       
        this.sortBy = event.detail.fieldName;       
        this.sortDirection = event.detail.sortDirection;       
        this.sortAccountData(event.detail.fieldName, event.detail.sortDirection);
    }


    sortAccountData(fieldname, direction) {
        
        let parseData = JSON.parse(JSON.stringify(this.accounts));
       
        let keyValue = (a) => {
            return a[fieldname];
        };


       let isReverse = direction === 'asc' ? 1: -1;


           parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
           
            return isReverse * ((x > y) - (y > x));
        });
        
        this.accounts = parseData;


    }


    // This function is used to refresh the table once data updated
    async refresh() {
        await refreshApex(this.contacts);
    }
}