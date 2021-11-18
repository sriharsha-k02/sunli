public class accountListController {

     @AuraEnabled(Cacheable = true)
    public static List<Account> getAccountLst(String searchKey) {
        String strKey = '%' + searchKey + '%';
        String industry = system.Label.Industry;
        return [SELECT Id, Name,Owner.Name,Phone, website,AnnualRevenue  FROM Account where Name LIKE: strKey AND Industry =:industry];
    }
}