public class accountListController {

     @AuraEnabled(Cacheable = true)
    public static List<Account> getAccountLst(String searchKey) {
        String strKey = '%' + searchKey + '%';
        return [SELECT Id, Name,OwnerId,Phone, website,AnnualRevenue  FROM Account where Name LIKE: strKey limit 10];
    }
}