<template>
    <div @click="checkClick" ref="invoiceWrap" class="invoice-wrap flex flex-column">
        <form @submit.prevent="submitForm" class="invoice-content">
            <Loading v-show="loading"/>
            <h1 v-if="!editInvoice">New Invoice</h1>
            <h1 v-else>Edit Invoice</h1>

            <!-- Bill From -->
            <div class="bill-from flx flex-column">
                <h4>Bill From</h4>
                <div class="input flex flex-column">
                    <label for="billerStreetAddress">Street Address</label>
                    <input required type="text" id="billerStreetAddress" v-model="billerStreetAddress" />
                </div>
                <div class="location-details flex">
                    <div class="input flex flex-column">
                        <label for="billerCity">City</label>
                        <input required type="text" id="billerCity" v-model="billerCity" />
                    </div>
                    <div class="input flex flex-column">
                        <label for="billerZipCode">Zip Code</label>
                        <input required type="text" id="billerZipCode" v-model="billerZipCode" />
                    </div>
                    <div class="input flex flex-column">
                        <label for="billerCountry">Country</label>
                        <input required type="text" id="billerCountry" v-model="billerCountry" />
                    </div>
                </div>
            </div>

            <!-- Bill To -->
            <div class="bill-to flex flex-column">
                <h4>Bill To</h4>
                <div class="input flex flex-column">
                    <label for="clientName">Client Name</label>
                    <input required type="text" id="clientName" v-model="clientName" />
                </div>
                <div class="input flex flex-column">
                    <label for="clientEmail">Client's Email</label>
                    <input required type="text" id="clientEmail" v-model="clientEmail" />
                </div>
                <div class="input flex flex-column">
                    <label for="clientStreetAddress">Client's Address</label>
                    <input required type="text" id="clientStreetAddress" v-model="clientStreetAddress" />
                </div>
                <div class="location-details flex">
                    <div class="input flex flex-column">
                        <label for="clientCity">CLient's City</label>
                        <input required type="text" id="clientCity" v-model="clientCity" />
                    </div>
                    <div class="input flex flex-column">
                        <label for="clientZipCode">Client's Zip Code</label>
                        <input required type="text" id="clientZipCode" v-model="clientZipCode" />
                    </div>
                    <div class="input flex flex-column">
                        <label for="clientCountry">Client's Country</label>
                        <input required type="text" id="clientCountry" v-model="clientCountry" />
                    </div>
                </div>
            </div>

            <!-- Invoice Work Details -->
            <div class="invoice-work flex flex-column">
                <div class="payment flex">
                    <div class="input flex flex-column">
                        <label for="invoiceDate">Invoice Date</label>
                        <input disabled type="text" id="invoiceDate" v-model="invoiceDate" />
                    </div>
                    <div class="input flex flex-column">
                        <label for="paymentDueDate">Payment Due</label>
                        <input disabled type="text" id="paymentDueDate" v-model="paymentDueDate" />
                    </div>
                </div>
                <div class="input flex flex-column">
                    <label for="paymentTerms">Payment Terms</label>
                    <select required id="paymentTerms" v-model="paymentTerms">
                        <option value="30">Net 30 Days</option>
                        <option value="60">Net 60 Days</option>
                    </select>
                </div>
                <div class="input flex flex-column">
                    <label for="productDescription">Produect Description</label>
                    <input required type="text" id="productDescription" v-model="productDescription" />
                </div>
                <div class="work-item">
                    <h3>Item List</h3>
                    <table class="item-list">
                        <tr class="table-heading flex">
                            <th class="item-name">Item Name</th>
                            <th class="qty">Qty</th>
                            <th class="price">Price</th>
                            <th class="total">Total</th>
                        </tr>
                        <tr class="table-items flex" v-for="(item,index) in invoiceItemList" :key="index">
                            <td class="item-name"><input type="text" v-model="item.itemName"></td>
                            <td class="qty"><input type="text" v-model="item.qty"></td>
                            <td class="price"><input type="text" v-model="item.price"></td>
                            <td class="total">${{(item.total = item.qty * item.price)}}</td>
                            <img @click="deleteInvoiceItem(item.id)" src="@/assets/icon-delete.svg" alt="">
                        </tr>
                    </table>
                    <div @click="addNewInvoiceItem" class="flex button">
                        <img src="@/assets/icon-plus.svg" alt="">
                        Add new Item
                    </div>
                </div>
                

                <!-- Save/Exit -->
                <div class="flex save">
                    <div class="left">
                        <button type="button" @click="closeInvoice" class="red">Cancel</button>
                    </div>
                    <div class="right flex">
                        <button v-if="!editInvoice" type="submit" @click="saveDraft" class="dark-purple">Save Draft</button>
                        <button v-if="!editInvoice" type="submit" @click="publishInvoice" class="purple">Create Invocie</button>
                        <button v-if="editInvoice" type="submit" @click="updateInvoice" class="purple">Update Invoice</button>
                    </div>
                </div>
            </div>

            <!-- Payment Term-->

        </form>
    </div>
</template>

<script>
import {collection, addDoc,doc,updateDoc} from 'firebase/firestore'
import {db} from '@/firebase/firebaseInit'
import Loading from '../components/Loading.vue'
import {mapActions, mapMutations, mapState} from 'vuex'
import {uid} from 'uid'
export default {

name:"invoiceModal",
components:{
    Loading,
},
data(){
    return{
        dateOptions:{year:"numeric", month:"short",day:"numeric"},
        loading:null,
        docId:null,
        billerStreetAddress:null,
        billerCity:null,
        billerZipCode:null,
        billerCountry:null,
        clientName:null,
        clientEmail:null,
        clientStreetAddress:null,
        clientCity:null,
        clientZipCode:null,
        clientCountry:null,
        invoiceDateUnix:null,
        invoiceDate:null,
        paymentTerms:null,
        paymentDueDateUnix:null,
        paymentDueDate:null,
        productDescription:null,
        invoicePending:null,
        invoiceDraft:null,
        invoiceItemList:[],
        invoiceTotal:0,
    }
},
created(){
    //  Get current date for invoice date field
    if(!this.editInvoice){
        this.invoiceDateUnix = Date.now()
        this.invoiceDate = new Date(this.invoiceDateUnix).toLocaleDateString('en-GB',this.dateOptions)
    }
    if(this.editInvoice){
        const currentInvoice = this.currentInvoiceArray[0]
        this.docId=currentInvoice.docId,
        this.billerStreetAddress=currentInvoice.billerStreetAddress,
        this.billerCity=currentInvoice.billerCity,
        this.billerZipCode=currentInvoice.billerZipCode,
        this.billerCountry=currentInvoice.billerCountry,
        this.clientName=currentInvoice.clientName,
        this.clientEmail=currentInvoice.clientEmail,
        this.clientStreetAddress=currentInvoice.clientStreetAddress,
        this.clientCity=currentInvoice.clientCity,
        this.clientZipCode=currentInvoice.clientZipCode,
        this.clientCountry=currentInvoice.clientCountry,
        this.invoiceDateUnix=currentInvoice.invoiceDateUnix,
        this.invoiceDate=currentInvoice.invoiceDate,
        this.paymentTerms=currentInvoice.paymentTerms,
        this.paymentDueDateUnix=currentInvoice.paymentDueDateUnix,
        this.paymentDueDate=currentInvoice.paymentDueDate,
        this.productDescription=currentInvoice.productDescription,
        this.invoiceItemList =currentInvoice.invoiceItemList,
        this.invoicePending=currentInvoice.invoicePending,
        this.invoiceDraft=currentInvoice.invoiceDraft,
        this.invoiceTotal=currentInvoice.invoiceTotal,
        this.invoicePaid=currentInvoice.invoicePaid
    }

},
computed:{
    ...mapState(['editInvoice','currentInvoiceArray'])
},
methods:{
    ...mapMutations(['TOGGLE_INVOICE','TOGGLE_MODAL','TOGGLE_EDIT_INVOICE']),
    ...mapActions(['UPDATE_INVOICE','GET_INVOICES']),
    checkClick(e){
        if(e.target === this.$refs.invoiceWrap){
            this.TOGGLE_MODAL()
            
        }
    },
    addNewInvoiceItem(){
    this.invoiceItemList.push({
        id:uid(),
        itemName:'',
        qty:'',
        total:0,
        price:0,
    })
    },
    deleteInvoiceItem(id){
        this.invoiceItemList = this.invoiceItemList.filter(item=>item.id !== id)
    },
    calInvoiceTotal(){
        this.invoiceTotal = 0
        this.invoiceItemList.forEach(item=>{
            this.invoiceTotal += item.total;
        });
    },

    closeInvoice(){
        this.TOGGLE_INVOICE()
        if(this.editInvoice){
            this.TOGGLE_EDIT_INVOICE()
        }
    },
    saveDraft(){
        this.invoiceDraft = true
    },
    publishInvoice(){
        this.invoicePending = true
    },

    async uploadInvoice(){
        if(this.invoiceItemList.length<=0){
            alert('Please ensure your filled out work items!')
            return
        }
        this.loading = true
        this.calInvoiceTotal()
        // ------- Firebase -------- //
        await addDoc(collection(db,'invoices'),
            {
                invoiceId:uid(6),
                billerStreetAddress:this.billerStreetAddress,
                billerCity:this.billerCity,
                billerZipCode:this.billerZipCode,
                billerCountry:this.billerCountry,
                clientName:this.clientName,
                clientEmail:this.clientEmail,
                clientStreetAddress:this.clientStreetAddress,
                clientCity:this.clientCity,
                clientZipCode:this.clientZipCode,
                clientCountry:this.clientCountry,
                invoiceDateUnix:this.invoiceDateUnix,
                invoiceDate:this.invoiceDate,
                paymentTerms:this.paymentTerms,
                paymentDueDateUnix:this.paymentDueDateUnix,
                paymentDueDate:this.paymentDueDate,
                productDescription:this.productDescription,
                invoiceItemList:this.invoiceItemList,
                invoicePending:this.invoicePending,
                invoiceDraft:this.invoiceDraft,
                invoiceTotal:this.invoiceTotal,
                invoicePaid:null,
            })
        this.loading = false;

        this.GET_INVOICES();
        this.TOGGLE_INVOICE();
    },

    async updateInvoice(){
        if(this.invoiceItemList.length<=0){
            alert('Please ensure your filled out work items!')
            return
        }
        this.loading = true;
        this.calInvoiceTotal();
        // ------- Firebase -------- //
        const docRef = doc(db,'invoices',`${this.docId}`)
        // Update
        await updateDoc(docRef,{
            billerStreetAddress:this.billerStreetAddress,
            billerCity:this.billerCity,
            billerZipCode:this.billerZipCode,
            billerCountry:this.billerCountry,
            clientName:this.clientName,
            clientEmail:this.clientEmail,
            clientStreetAddress:this.clientStreetAddress,
            clientCity:this.clientCity,
            clientZipCode:this.clientZipCode,
            clientCountry:this.clientCountry,
            paymentTerms:this.paymentTerms,
            paymentDueDateUnix:this.paymentDueDateUnix,
            paymentDueDate:this.paymentDueDate,
            productDescription:this.productDescription,
            invoiceItemList:this.invoiceItemList,
            invoiceTotal:this.invoiceTotal,
        })
        this.loading = false;
        const data = {
            docId:this.docId,
            routeId:this.$route.params.invoiceId
            }
        this.UPDATE_INVOICE(data);
    },
    submitForm(){
        if(!this.editInvoice){
            this.uploadInvoice()
            return
        }
        this.updateInvoice()
        this.GET_INVOICES();
    }
},
watch:{
    paymentTerms(){
        const futureDate= new Date()
        this.paymentDueDateUnix = futureDate.setDate(futureDate.getDate() + parseInt(this.paymentTerms));
        this.paymentDueDate = new Date(this.paymentDueDateUnix).toLocaleDateString('en-GB',this.dateOptions)
    }
},


}
</script>

<style lang="scss" scoped>

.invoice-wrap{
    position: fixed;
    background: transparent;
    top:0;
    left:0;
    width:100%;
    height:100vh;
    overflow:scroll;
    &::-webkit-scrollbar{
        display: none;
    }
    @media (min-width:900px){
        left:90px;
    }
    .invoice-content{
        position: relative;
        padding:56px;
        max-width: 700px;
        width:100%;
        background-color:#141625;
        color:white;
        box-shadow: 10px 4px 6px -1px rgba(black,0.2), 0 2px 4px -1px rgba(black, 0.06);

        h1{
            margin-bottom:48px;
            color:white;
        }
        h3{
            margin-bottom:16px;
            font-size:18px;
            color:#777f98;
        }
        h4{
            color:#7c5dfa;
            font-size:12px;
            margin-bottom:24px;
        }

        // Bill To / Bill From

        .bill-to, .bill-from{
            margin-bottom: 48px;
            
            .location-details {
                gap:16px;
                
                div {
                    flex:1;
                }
            }
        }

        // Invoice Work
        .invoice-work{
            .payment{
                gap:24px;
                div{
                    flex:1;
                }
            }
            .work-item{
                .item-list{
                    width:100%;

                    // Item Table Styling

                    .table-heading,
                    .table-items{
                        gap:16px;
                        font-size:12px;

                        .item-name{
                            flex-basis:50%;
                        }
                        .qty{
                            flex-basis:10%;
                        }
                        .price{
                            flex-basis:20%;
                        }
                        .total{
                            flex-basis:20%;
                            align-self: center;
                        }
                    }
                    .table-heading{
                        margin-bottom:16px;
                        th{
                            text-align:left;
                        }
                    }
                    .table-items{
                        position: relative;
                        margin-bottom:24px;
                        img{
                            position: absolute;
                            top:15px;
                            width:16px;
                            right:0;
                            height:20px;
                            cursor: pointer;
                            &:hover{
                                filter: invert(35%) sepia(82%) saturate(2088%) hue-rotate(337deg) brightness(117%) contrast(87%);
                            }


                        }
                    }
                }
                .button{
                    color:white;
                    background-color: #252945;
                    align-items: center;
                    justify-content:center;
                    width:100%;
                    
                    img{
                        margin-right:4px;
                    }
                }
            }
        }

        .save{
            margin-top: 60px;
            div{
                flex:1;
            }
            .right{
                justify-content: flex-end;
            }
        }
    }

    label{
        font-size:12px;
        margin-bottom: 6px;
    }
    input,select{
        width:100%;
        background-color: #1e2139;
        color:white;
        border-radius: 4px;
        padding:12px 4px;
        border: none;
        &:focus{
            outline:none;
        }
    }
}

</style>