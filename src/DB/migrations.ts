export default [
    {
        name: "initial_migration",
        query: `
            CREATE TABLE migrations (
                id serial PRIMARY KEY,
                name text UNIQUE not null,
                migration_group int not null,
                migrated_at timestamp not null
            );`,
        rollback_query: `DROP TABLE migrations;`
    },
    {
        name: "create_accounts_table",
        query: `
            CREATE TABLE IF NOT EXISTS public.accounts
            (
                id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                name character varying(300) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Player'::character varying,
                device_id character varying(500) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
                gems integer NOT NULL DEFAULT 0,
                is_online integer NOT NULL DEFAULT 0,
                client_id integer NOT NULL DEFAULT 0,
                trophies integer NOT NULL DEFAULT 0,
                banned integer NOT NULL DEFAULT 0,
                shield timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                xp integer NOT NULL DEFAULT 0,
                level integer NOT NULL DEFAULT 1,
                clan_join_timer timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                clan_id bigint NOT NULL DEFAULT 0,
                clan_rank integer NOT NULL DEFAULT 0,
                war_id bigint NOT NULL DEFAULT '-1'::integer,
                war_pos integer NOT NULL DEFAULT 0,
                global_chat_blocked integer NOT NULL DEFAULT 0,
                clan_chat_blocked integer NOT NULL DEFAULT 0,
                last_chat timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                chat_color character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
                email character varying(1000) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
                password character varying(1000) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
                map_layout integer NOT NULL DEFAULT 0,
                shld_cldn_1 timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                shld_cldn_2 timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                shld_cldn_3 timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_login timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT accounts_pkey PRIMARY KEY (id)
            );`,
        rollback_query: `DROP TABLE accounts;`
    },
    {
        name: "create_battles_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.battles
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            attacker_id bigint NOT NULL,
            defender_id bigint NOT NULL,
            replay_path character varying(2000) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            end_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            stars integer NOT NULL DEFAULT 0,
            trophies integer NOT NULL DEFAULT 0,
            looted_gold integer NOT NULL DEFAULT 0,
            looted_elixir integer NOT NULL DEFAULT 0,
            looted_dark_elixir integer NOT NULL DEFAULT 0,
            seen integer NOT NULL DEFAULT 0,
            CONSTRAINT battles_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE battles;`
    },
    {
        name: "create_buildings_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.buildings
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            global_id character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
            account_id bigint NOT NULL,
            level integer NOT NULL DEFAULT 0,
            x_position integer NOT NULL DEFAULT 0,
            y_position integer NOT NULL DEFAULT 0,
            gold_storage real NOT NULL DEFAULT 0,
            elixir_storage real NOT NULL DEFAULT 0,
            dark_elixir_storage real NOT NULL DEFAULT 0,
            boost timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            construction_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            is_constructing integer NOT NULL DEFAULT 0,
            construction_build_time integer NOT NULL DEFAULT 0,
            track_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            x_war integer NOT NULL DEFAULT '-1'::integer,
            y_war integer NOT NULL DEFAULT '-1'::integer,
            CONSTRAINT buildings_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE buildings;`
    },
    {
        name: "create_chat_messages_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.chat_messages
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            account_id bigint NOT NULL DEFAULT 0,
            type integer NOT NULL DEFAULT 0,
            global_id bigint NOT NULL DEFAULT 0,
            clan_id bigint NOT NULL DEFAULT 0,
            message character varying(1000) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            send_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT chat_messages_pkey PRIMARY KEY (id)
        )
        ;`,
        rollback_query: `DROP TABLE chat_messages;`
    },
    {
        name: "create_chat_reports_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.chat_reports
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            message_id bigint NOT NULL,
            reporter_id bigint NOT NULL,
            target_id bigint NOT NULL,
            message character varying(500) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            report_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT chat_reports_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE chat_reports;`
    },
    {
        name: "create_clan_join_requests_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.clan_join_requests
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            clan_id bigint NOT NULL,
            account_id bigint NOT NULL,
            request_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT clan_join_requests_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE clan_join_requests;`
    },
    {
        name: "create_clan_war_attacks_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.clan_war_attacks
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            war_id bigint NOT NULL,
            attacker_id bigint NOT NULL,
            defender_id bigint NOT NULL,
            start_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            stars integer NOT NULL DEFAULT 0,
            looted_gold integer NOT NULL DEFAULT 0,
            looted_elixir integer NOT NULL DEFAULT 0,
            looted_dark_elixir integer NOT NULL DEFAULT 0,
            replay_path character varying(2000) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
            CONSTRAINT clan_war_attacks_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE clan_war_attacks;`
    },
    {
        name: "create_clan_wars_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.clan_wars
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            clan_1_id bigint NOT NULL,
            clan_2_id bigint NOT NULL,
            start_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            stage integer NOT NULL DEFAULT 1,
            report_path character varying(2000) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
            winner_id bigint NOT NULL DEFAULT 0,
            clan_1_stars integer NOT NULL DEFAULT 0,
            clan_2_stars integer NOT NULL DEFAULT 0,
            war_size integer NOT NULL DEFAULT 0,
            CONSTRAINT clan_wars_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE clan_wars;`
    },
    {
        name: "create_clan_wars_search_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.clan_wars_search
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            clan_id bigint NOT NULL,
            account_id bigint NOT NULL,
            search_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT clan_wars_search_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE clan_wars_search;`
    },
    {
        name: "create_clans_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.clans
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            name character varying(300) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            join_type integer NOT NULL DEFAULT 0,
            xp integer NOT NULL DEFAULT 0,
            level integer NOT NULL DEFAULT 1,
            trophies integer NOT NULL DEFAULT 0,
            min_trophies integer NOT NULL DEFAULT 0,
            min_townhall_level integer NOT NULL DEFAULT 1,
            pattern integer NOT NULL DEFAULT 0,
            background integer NOT NULL DEFAULT 0,
            pattern_color character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            background_color character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            war_id bigint NOT NULL DEFAULT 0,
            CONSTRAINT clans_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE clans;`
    },
    {
        name: "create_iap_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.iap
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            account_id bigint NOT NULL,
            market character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            product_id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            token character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            save_time timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            price character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT '0'::character varying,
            currency character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'USD'::character varying,
            validated integer NOT NULL DEFAULT 0,
            CONSTRAINT iap_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE iap;`
    },
    {
        name: "create_research_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.research
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            type integer NOT NULL,
            account_id bigint NOT NULL,
            global_id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            level integer NOT NULL DEFAULT 1,
            researching timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT research_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE research;`
    },
    {
        name: "create_server_buildings_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.server_buildings
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            global_id character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
            level integer NOT NULL DEFAULT 0,
            req_gold integer NOT NULL DEFAULT 0,
            req_elixir integer NOT NULL DEFAULT 0,
            req_gems integer NOT NULL DEFAULT 0,
            req_dark_elixir integer NOT NULL DEFAULT 0,
            columns_count integer NOT NULL DEFAULT 0,
            rows_count integer NOT NULL DEFAULT 0,
            capacity integer NOT NULL DEFAULT 0,
            gold_capacity integer NOT NULL DEFAULT 0,
            elixir_capacity integer NOT NULL DEFAULT 0,
            dark_elixir_capacity integer NOT NULL DEFAULT 0,
            speed real NOT NULL DEFAULT 0,
            health integer NOT NULL DEFAULT 100,
            damage real NOT NULL DEFAULT 0,
            target_type character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'none'::character varying,
            radius real NOT NULL DEFAULT 0,
            blind_radius real NOT NULL DEFAULT 0,
            splash_radius real NOT NULL DEFAULT 0,
            projectile_speed real NOT NULL DEFAULT 0,
            build_time integer NOT NULL DEFAULT 0,
            gained_xp integer NOT NULL DEFAULT 0,
            CONSTRAINT server_buildings_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE server_buildings;`
    },
    {
        name: "create_server_quest_battles",
        query: `
        CREATE TABLE IF NOT EXISTS public.server_quest_battles
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
            category integer NOT NULL DEFAULT 0,
            order_index integer NOT NULL,
            class_dara text COLLATE pg_catalog."default" NOT NULL,
            CONSTRAINT server_quest_battles_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE server_quest_battles;`
    },
    {
        name: "create_server_spells_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.server_spells
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            global_id character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
            level integer NOT NULL DEFAULT 1,
            building_code integer NOT NULL DEFAULT 0,
            req_gold integer NOT NULL DEFAULT 0,
            req_elixir integer NOT NULL DEFAULT 0,
            req_gem integer NOT NULL DEFAULT 0,
            req_dark_elixir integer NOT NULL DEFAULT 0,
            brew_time integer NOT NULL DEFAULT 0,
            housing integer NOT NULL DEFAULT 1,
            radius real NOT NULL DEFAULT 1,
            pulses_count integer NOT NULL DEFAULT 0,
            pulses_duration real NOT NULL DEFAULT 0,
            pulses_value real NOT NULL DEFAULT 0,
            pulses_value_2 real NOT NULL DEFAULT 0,
            research_time integer NOT NULL DEFAULT 0,
            research_gold integer NOT NULL DEFAULT 0,
            research_elixir integer NOT NULL DEFAULT 0,
            research_dark_elixir integer NOT NULL DEFAULT 0,
            research_gems integer NOT NULL DEFAULT 0,
            research_xp integer NOT NULL DEFAULT 0,
            CONSTRAINT server_spells_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE server_spells;`
    },
    {
        name: "create_server_units_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.server_units
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            global_id character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
            level integer NOT NULL DEFAULT 1,
            building_code integer NOT NULL DEFAULT 0,
            req_gold integer NOT NULL DEFAULT 0,
            req_elixir integer NOT NULL DEFAULT 0,
            req_gem integer NOT NULL DEFAULT 0,
            req_dark_elixir integer NOT NULL DEFAULT 0,
            train_time integer NOT NULL DEFAULT 0,
            health integer NOT NULL DEFAULT 10,
            housing integer NOT NULL DEFAULT 1,
            damage real NOT NULL DEFAULT 1,
            attack_range real NOT NULL DEFAULT 0,
            attack_speed real NOT NULL DEFAULT 1,
            splash_range real NOT NULL DEFAULT 0,
            projectile_speed real NOT NULL DEFAULT 0,
            move_speed real NOT NULL DEFAULT 1,
            move_type character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ground'::character varying,
            target_priority character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'all'::character varying,
            priority_multiplier real NOT NULL DEFAULT 1,
            research_time integer NOT NULL DEFAULT 0,
            research_gold integer NOT NULL DEFAULT 0,
            research_elixir integer NOT NULL DEFAULT 0,
            research_dark_elixir integer NOT NULL DEFAULT 0,
            research_gems integer NOT NULL DEFAULT 0,
            research_xp integer NOT NULL DEFAULT 0,
            CONSTRAINT server_units_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE server_units;`
    },
    {
        name: "create_spells_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.spells
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            global_id character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
            level integer NOT NULL DEFAULT 1,
            account_id bigint NOT NULL,
            brewed integer NOT NULL DEFAULT 0,
            ready integer NOT NULL DEFAULT 0,
            brewed_time real NOT NULL DEFAULT 0,
            CONSTRAINT spells_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE spells;`
    },
    {
        name: "create_units_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.units
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            global_id character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
            level integer NOT NULL DEFAULT 1,
            account_id bigint NOT NULL,
            trained integer NOT NULL DEFAULT 0,
            ready integer NOT NULL DEFAULT 0,
            trained_time real NOT NULL DEFAULT 0,
            CONSTRAINT units_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE units;`
    },
    {
        name: "create_verification_codes_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.verification_codes
        (
            id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            target character varying(1000) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            device_id character varying(1000) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            code character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT NULL::character varying,
            expire_time timestamp without time zone NOT NULL,
            CONSTRAINT verification_codes_pkey PRIMARY KEY (id)
        );`,
        rollback_query: `DROP TABLE verification_codes;`
    },

    // for better logging
    {
        name: "create_logs_table",
        query: `
            CREATE TABLE logs (
                id serial PRIMARY KEY,
                created_at timestamp default current_timestamp not null,
                file text not null,
                function text not null,
                log text not null
            );
            CREATE INDEX logs_created_at_idx ON logs(created_at);
        `,
        rollback_query: `
            DROP INDEX logs_created_at_idx;
            DROP TABLE logs;
        `,
    },

    // migrate to use address
    {
        name: "add_address_to_accounts",
        query: `
            ALTER TABLE accounts
            ADD COLUMN address text not null,
            ADD CONSTRAINT constraint_accounts_address UNIQUE (address);
        `,
        rollback_query: `
            ALTER TABLE accounts
            DROP COLUMN address;
        `,
    },

    // add mint address to accounts
    {
        name: "add_mint_address_to_accounts",
        query: `
            ALTER TABLE accounts
            ADD COLUMN mint_address text;
        `,
        rollback_query: `
            ALTER TABLE accounts
            DROP COLUMN mint_address;
        `,
    },

    // add mint address pivot tables
    // {
    //     name: "create_account_mint_addresses_table",
    //     query: `
    //         CREATE TABLE account_mint_addresses (
    //             id serial PRIMARY KEY,
    //             created_at timestamp default current_timestamp not null,
    //             account_id text not null,
    //             mint_address text not null
    //         );
    //         CREATE INDEX account_mint_addresses_created_at_idx ON account_mint_addresses(created_at);
    //     `,
    //     rollback_query: `
    //         DROP INDEX account_mint_addresses_created_at_idx;
    //         DROP TABLE account_mint_addresses;
    //     `,
    // },

    // add mint address to buildings
    {
        name: "add_mint_address_to_buildings",
        query: `
            ALTER TABLE buildings
            ADD COLUMN mint_address text;
        `,
        rollback_query: `
            ALTER TABLE buildings
            DROP COLUMN mint_address;
        `,
    },

    {
        name: "add_is_in_inventory_to_buildings",
        query: `
            ALTER TABLE buildings
            ADD COLUMN is_in_inventory bool not null default(false);
        `,
        rollback_query: `
            ALTER TABLE buildings
            DROP COLUMN is_in_inventory;
        `,
    },

    {
        name: "add_is_cnft_to_buildings",
        query: `
            ALTER TABLE buildings
            ADD COLUMN is_cnft bool not null default(false);
        `,
        rollback_query: `
            ALTER TABLE buildings
            DROP COLUMN is_cnft;
        `,
    },

    // guild cache
    {
        name: "create_guilds_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.guilds
        (
            id serial PRIMARY KEY,
            mint_address text UNIQUE not null,
            logo text null,
            name text null
        );
        CREATE INDEX guilds_mint_address_idx ON guilds(mint_address);`,
        rollback_query: `DROP INDEX guilds_mint_address_idx; DROP TABLE guilds;`
    },

    {
        name: "add_guild_id_to_accounts",
        query: `
            ALTER TABLE accounts
            ADD COLUMN guild_id bigint;`,
        rollback_query: `
            ALTER TABLE accounts
            DROP COLUMN guild_id;
        `,
    },
    //lands
    {
        name: "create_lands_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.lands
        (
            id serial PRIMARY KEY,
            mint_address text,
            x int not null,
            y int not null,
            level int not null,
            citizen_cap int not null,
            gems_per_block decimal(18, 8) not null,
            owner_address text,
            guild_id bigint,
            is_booked boolean default false,
            minted_at timestamp
        );`,
        rollback_query: `DROP TABLE lands;`
    },

    // land pivot table
    {
        name: "create_land_citizens_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.land_citizens
        (
            id serial PRIMARY KEY,
            account_id bigint UNIQUE not null,
            land_id bigint not null
        );`,
        rollback_query: `DROP TABLE land_citizens;`
    },
    // forums // might need to go on chain?
    {
        name: "create_forum_posts_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.forum_posts
        (
            id serial PRIMARY KEY,
            guild_id bigint not null,
            title text not null,
            description text,
            content text not null,
            voting_id text, -- on chain voting
            created_by text not null, -- address
            created_at timestamp default current_timestamp
        );`,
        rollback_query: `DROP TABLE forum_posts;`
    },
    {
        name: "create_forum_comments_table",
        query: `
        CREATE TABLE IF NOT EXISTS public.forum_comments
        (
            id serial PRIMARY KEY,
            forum_post_id bigint not null,
            comment text not null,
            created_by text not null, -- address
            created_at timestamp default current_timestamp
        );`,
        rollback_query: `DROP TABLE forum_comments;`
    },

    // payments table, use helius webhook
    // {
    //     name: "create_payments_table",
    //     query: `
    //     CREATE TABLE IF NOT EXISTS public.payments
    //     (
    //         id serial PRIMARY KEY,
    //         account_id bigint not null,
    //         tx_id text not null,
    //         amount_usd decimal(18,8) not null
    //     );`,
    //     rollback_query: `DROP TABLE payments;`
    // },
];