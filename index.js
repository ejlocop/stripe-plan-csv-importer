require('dotenv').config();
const csvFilePath = process.env.FILE;
const csv = require('csvtojson');


let Stripe = require('stripe')(process.env.STRIPE_SECRET);

const stripeImport = {
    plans: [],

    init () {
        this.readCsv()
            .on('done', (error) => {
                if (error)
                console.error(error);
                // this.startDelete();
                this.startImport();
            });;
    },

    readCsv () {
        return csv()
        .fromFile(csvFilePath)
        .on('json', (jsonObj) => {
            this.plans.push(jsonObj);
        })
    },

    startImport () {
        this.plans.forEach((plan, index) => {
            Stripe.plans.create({
                amount: plan['Amount'],
                interval: plan['Interval'],
                name: plan['Name'],
                currency: plan['Currency'],
                id: plan['id'],
                trial_period_days: Number(plan['Trial Period Days']),
                statement_descriptor: plan['Statement Descriptor'],
            }, (err, plan) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(`Plan Created: ${plan.name}`);
            });
        });
    },

    startDelete () {
        this.plans.forEach((plan,index) => {
            this.deletePlan(plan['id']);
        });
    },

    resetPlans () {
        this.startDelete()
            .startImport();
    },

    deletePlan (id) {
        Stripe.plans.del(
            id,
            (err, confirmation) => {
                console.log(err, confirmation);
            }
        );
    },
};

stripeImport.init();
