CREATE TABLE "users"(
    "id" BIGINT NOT NULL,
    "phonenumber" BIGINT NOT NULL,
    "user_name" BIGINT NOT NULL,
    "email" BIGINT NOT NULL,
    "free_messages" INTEGER NOT NULL,
    "service_at" BIGINT NOT NULL,
    "status" BIGINT NOT NULL
);
ALTER TABLE
    "users" ADD PRIMARY KEY("id");
ALTER TABLE
    "users" ADD PRIMARY KEY("phonenumber");
CREATE TABLE "payments"(
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "subscription_id" VARCHAR(255) CHECK
        (
            "subscription_id" IN('grok', 'gover')
        ) NOT NULL,
        "amount" FLOAT(53) NOT NULL,
        "status" VARCHAR(255)
    CHECK
        (
            "status" IN('success', 'failed', 'pending')
        ) NOT NULL
);
ALTER TABLE
    "payments" ADD PRIMARY KEY("id");
CREATE TABLE "subscriptions"(
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "price" FLOAT(53) NOT NULL,
    "model" VARCHAR(255) CHECK
        (
            "model" IN(
                'grok-beta',
                'grok-vision-beta',
                'grok-2-
grok-2-1212'
            )
        ) NOT NULL,
        "question_limit" INTEGER NOT NULL,
        "description" TEXT NOT NULL
);
ALTER TABLE
    "subscriptions" ADD PRIMARY KEY("id");
CREATE TABLE "userSubscription"(
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "subscription_id" BIGINT NOT NULL,
    "remaining_Qs" BIGINT NOT NULL
);
ALTER TABLE
    "userSubscription" ADD PRIMARY KEY("id");
CREATE TABLE "messages"(
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "model" TEXT NOT NULL
);
CREATE INDEX "messages_user_id_index" ON
    "messages"("user_id");
ALTER TABLE
    "messages" ADD PRIMARY KEY("id");
ALTER TABLE
    "payments" ADD CONSTRAINT "payments_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "userSubscription" ADD CONSTRAINT "usersubscription_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "messages" ADD CONSTRAINT "messages_model_foreign" FOREIGN KEY("model") REFERENCES "subscriptions"("model");
ALTER TABLE
    "payments" ADD CONSTRAINT "payments_subscription_id_foreign" FOREIGN KEY("subscription_id") REFERENCES "subscriptions"("id");
ALTER TABLE
    "messages" ADD CONSTRAINT "messages_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "userSubscription" ADD CONSTRAINT "usersubscription_subscription_id_foreign" FOREIGN KEY("subscription_id") REFERENCES "subscriptions"("id");