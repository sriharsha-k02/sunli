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
        fieldName: 'OwnerName',
        type: 'text',
        sortable: true,
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
    accounts;
    saveDraftValues = [];
    searchKey = '';
    sortBy;
    sortDirection;
    @wire(getAccounts,{ searchKey: '$searchKey' })
    cons(result) {
        if (result.data) {
            this.accounts = result.data.map(row=>{
                return{...row, OwnerName: row.Owner.Name}
            })
            this.error = undefined;
   
        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
   
    };
    handleKeyChange(event) {
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

        // Update record using the UiRecordAPi
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


    // Refresh the table after data is updated
    refresh() {
        refreshApex(this.accounts);
    }
}