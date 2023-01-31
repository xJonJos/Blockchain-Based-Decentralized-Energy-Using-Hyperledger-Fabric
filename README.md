# Blockchain-Based-Decentralized-Energy-Using-Hyperledger-Fabric
This blockchain project focused on CRUD (Create, Read, Update, Delete) operations is aimed to provide a decentralized and secure platform for storing and managing energy data. The project utilizes blockchain technology to ensure the immutability and integrity of the data, while also enabling multiple parties to access and modify the data in a transparent and traceable manner.

The project includes features such as smart contract functionality for executing automated data transactions, uses IBM Blockchain Extension for CRUD operations, and encryption for securing sensitive information. By using a blockchain-based solution, the project could eliminate the need for intermediaries and increase the efficiency of data management processes, while also providing a tamper-proof record of all data transactions.


**Prerequisites**

**Ubunut 20.04, 8 GB RAM, IBM Blockchain Extension (VSCode)**

*Note* : Other requirements are installed using the installDependencies.sh file. 

Step 0  : Clone this repository to the root directory.
      
            git clone https://github.com/Jon-Jos/Blockchain-Based-Decentralized-Energy-Using-Hyperledger-Fabric.git

Step 1  : Execute the file *installDependencies.sh* in the *Network* directory.

            chmod +x installDependencies.sh 
            ./installDependencies.sh
            
step 2  : Restart the Operating System. After restart run below command.

            ./installDependencies.sh bin  
            
**We use this spec.yaml file to build the network. Make sure it is saved properly.**

![IMG_20221115_111954_892](https://user-images.githubusercontent.com/71092045/202915861-1263b5c1-b9d6-4085-8c8f-c31c45126353.png)        
        
 
step 3 : Spin up the network.
 
             ./startNetwork.sh
             
step 4: Integrate Fabric Network with VSCode 
      
            https://youtu.be/LKO_ulNHv54
            
step 5 : Create Gateways.

            https://youtu.be/vnIYSVUv1rI
            
step 6: Scafold a Smart Contract.

            https://youtu.be/RAQSMZG65as

step 7 : How to package the Chaincode.

            https://youtu.be/PsBHpU17eMU
            
step 8 : Deploying the Chaincode.

            https://youtu.be/QkvKlWAO8cw
            
step 9 : Invoking the Chaincode.

            https://youtu.be/zp7icyMLfWc
            
**Below file contains the input data set**

            Energy-Input-Set.txt
  
**When You Test the Functions You Will Get the Outputs As Follows:**


**True Case :**

![True Case](https://user-images.githubusercontent.com/71092045/202915737-1115fca3-1108-44b7-ac1c-79d875be03ee.png)


**False Case :**

![False Case](https://user-images.githubusercontent.com/71092045/202915770-50718270-47db-46f1-ac19-d548c9211bdf.png)

        
