public class accountListController {

     @AuraEnabled(Cacheable = true)
    public static List<Account> getAccountLst(String searchKey) {
        String strKey = '%' + searchKey + '%';
        return [SELECT Id, Name,Owner.Name,Phone, website,AnnualRevenue  FROM Account where Name LIKE: strKey AND Industry = 'Financial Services'];
    }
}