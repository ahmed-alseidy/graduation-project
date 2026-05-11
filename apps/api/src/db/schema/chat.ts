import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { workspaces } from "./workspace";

export const dmConversations = pgTable(
  "dm_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    user1Id: text("user1_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    user2Id: text("user2_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("dm_unique_pair_idx").on(t.workspaceId, t.user1Id, t.user2Id),
  ]
);

export const dmConversationRelations = relations(
  dmConversations,
  ({ many, one }) => ({
    workspace: one(workspaces, {
      fields: [dmConversations.workspaceId],
      references: [workspaces.id],
    }),
    user1: one(users, {
      fields: [dmConversations.user1Id],
      references: [users.id],
    }),
    user2: one(users, {
      fields: [dmConversations.user2Id],
      references: [users.id],
    }),
    messages: many(chatMessages),
  })
);

export const chatChannels = pgTable(
  "chat_channels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").notNull().default(true),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("chat_channels_workspace_id_idx").on(t.workspaceId),
    uniqueIndex("chat_channels_workspace_name_unique").on(
      t.workspaceId,
      t.name
    ),
  ]
);

export const chatChannelRelations = relations(
  chatChannels,
  ({ many, one }) => ({
    workspace: one(workspaces, {
      fields: [chatChannels.workspaceId],
      references: [workspaces.id],
    }),
    creator: one(users, {
      fields: [chatChannels.createdBy],
      references: [users.id],
    }),
    members: many(channelMembers),
    messages: many(chatMessages),
  })
);

export const channelMembers = pgTable(
  "channel_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channelId: uuid("channel_id")
      .references(() => chatChannels.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("channel_member_unique").on(t.channelId, t.userId),
    index("channel_members_user_id_idx").on(t.userId),
  ]
);

export const channelMemberRelations = relations(channelMembers, ({ one }) => ({
  channel: one(chatChannels, {
    fields: [channelMembers.channelId],
    references: [chatChannels.id],
  }),
  user: one(users, {
    fields: [channelMembers.userId],
    references: [users.id],
  }),
}));

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channelId: uuid("channel_id").references(() => chatChannels.id, {
      onDelete: "cascade",
    }),
    conversationId: uuid("conversation_id").references(
      () => dmConversations.id,
      { onDelete: "cascade" }
    ),
    parentMessageId: uuid("parent_message_id").references(
      () => chatMessages.id,
      {
        onDelete: "cascade",
      }
    ),
    senderId: text("sender_id").references(() => users.id, {
      onDelete: "set null",
    }),
    content: text("content"),
    fileUrl: text("file_url"),
    fileType: text("file_type"),
    fileName: text("file_name"),
    fileSize: integer("file_size"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => /* @__PURE__ */ new Date()
    ),
  },
  (t) => [
    check(
      "message_location_check",
      sql`(${t.channelId} IS NOT NULL OR ${t.conversationId} IS NOT NULL) AND NOT (${t.channelId} IS NOT NULL AND ${t.conversationId} IS NOT NULL)`
    ),
    index("messages_channel_created_idx").on(t.channelId, t.createdAt),
    index("messages_conversation_created_idx").on(
      t.conversationId,
      t.createdAt
    ),
    index("messages_parent_id_idx").on(t.parentMessageId),
  ]
);

export const chatMessageRelations = relations(
  chatMessages,
  ({ many, one }) => ({
    channel: one(chatChannels, {
      fields: [chatMessages.channelId],
      references: [chatChannels.id],
    }),
    conversation: one(dmConversations, {
      fields: [chatMessages.conversationId],
      references: [dmConversations.id],
    }),
    sender: one(users, {
      fields: [chatMessages.senderId],
      references: [users.id],
    }),
    parentMessage: one(chatMessages, {
      fields: [chatMessages.parentMessageId],
      references: [chatMessages.id],
      relationName: "message_replies",
    }),
    replies: many(chatMessages, {
      relationName: "message_replies",
    }),
    reactions: many(messageReactions),
    reads: many(messageReads),
  })
);

export const messageReactions = pgTable(
  "message_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .references(() => chatMessages.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    emoji: text("emoji").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("reaction_unique").on(t.messageId, t.userId, t.emoji)]
);

export const messageReactionRelations = relations(
  messageReactions,
  ({ one }) => ({
    message: one(chatMessages, {
      fields: [messageReactions.messageId],
      references: [chatMessages.id],
    }),
    user: one(users, {
      fields: [messageReactions.userId],
      references: [users.id],
    }),
  })
);

export const messageReads = pgTable(
  "message_reads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .references(() => chatMessages.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("message_user_unique").on(t.messageId, t.userId)]
);

export const messageReadRelations = relations(messageReads, ({ one }) => ({
  message: one(chatMessages, {
    fields: [messageReads.messageId],
    references: [chatMessages.id],
  }),
  user: one(users, {
    fields: [messageReads.userId],
    references: [users.id],
  }),
}));
