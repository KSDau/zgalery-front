import zgallery_nft.aleo;
import credits.aleo;


program zgallery_marketplace.aleo {

    const G : group = group::GEN;

    struct data {
        metadata: field,
        brand: address,
        form: field
    }

    struct Listing {
        nft_commit: field,
        listing_public_key: group,
        price: u64,
        purchased: bool,
        buyer_c : field,
        purchase_N : group,
        approved: bool
    }

    record ReceiptSeller {
        owner: address,
        listing_id: field,
        listing_private_key: scalar
    }

    record ReceiptBuyer {
        owner: address,
        listing_id: field,
        seller: address
    }

    record DataLog {
        owner: address,
        nft_commit: field,
        price: u64,
        form_answer: field,
        buyer: address,
        seller: address
    }

    mapping listings: field => Listing;


    inline commit_nft(
        nft_data: data,
        nft_edition: scalar
    ) -> field {
        let data_hash: field = BHP256::hash_to_field(nft_data);
        let commitment: field = BHP256::commit_to_field(data_hash, nft_edition);
        return commitment;
    }


    inline get_listing_public_key(
        private_key: scalar
    ) -> group {
        let public_key: group = private_key * G;
        return public_key;
    }


    inline encrypt_message(
        m: field,
        public_key: group,
        r: scalar
    ) -> (field, group) {
        let N : group = r * G;
        let E : group = r * public_key;
        let h : field = BHP256::hash_to_field(E);
        let c : field = m + h;

        return (c, N);
    }


    inline decrypt_message(
        c: field,
        N: group,
        private_key: scalar
    ) -> field {
        let E : group = private_key * N;
        let h : field = BHP256::hash_to_field(E);
        let m : field = c - h;

        return m;
    }


    async transition list(
        nft: zgallery_nft.aleo/NFT,
        price: u64,
        rand: scalar
    ) -> (ReceiptSeller, Future) {
        let nft_commit: field = commit_nft(nft.data, nft.edition);
        let (nft_view, transfer_future): (
            zgallery_nft.aleo/NFTView, Future
        ) = zgallery_nft.aleo/transfer_private_to_public(nft, self.address);

        let listing_private_key: scalar = rand;
        let listing_public_key: group = get_listing_public_key(listing_private_key);

        let listing: Listing = Listing {
            nft_commit: nft_commit,
            listing_public_key: listing_public_key,
            price: price,
            purchased: false,
            buyer_c: 0field,
            purchase_N: 0group,
            approved: false
        };

        let list_future: Future = finalize_list(listing, transfer_future);

        let receipt_seller: ReceiptSeller = ReceiptSeller {
            owner: self.signer,
            listing_id: nft_commit,
            listing_private_key: listing_private_key
        };

        return (receipt_seller, list_future);
    }
    async function finalize_list(
        listing: Listing,
        transfer_future: Future
    ){
        transfer_future.await();
        listings.set(listing.nft_commit, listing);
    }


    async transition cancel(
        receipt_seller: ReceiptSeller,
        nft_view: zgallery_nft.aleo/NFTView,
    ) -> (zgallery_nft.aleo/NFT, Future) {
        let (nft, nft_future): (
            zgallery_nft.aleo/NFT, Future
            ) = zgallery_nft.aleo/transfer_public_to_private(nft_view, self.signer);
        let cancel_future: Future = finalize_cancel(receipt_seller.listing_id, nft_future);

        return (nft, cancel_future);
    }


    async function finalize_cancel(listing_id: field, nft_future: Future){
        let listing: Listing = listings.get(listing_id);
        assert_eq(listing.purchased, false);
        nft_future.await();
        listings.remove(listing_id);
    }


    async transition purchase(
        aleo_credits: credits.aleo/credits,
        nft_commit: field,
        price: u64,
        rand: scalar
    ) -> (credits.aleo/credits, Future) {
        let (change, transfer_future): (
            credits.aleo/credits, Future
        ) = credits.aleo/transfer_private_to_public(aleo_credits, self.address, price);

        let purchase_future: Future = finalize_purchase(
            self.signer as field,
            nft_commit,
            price,
            rand,
            transfer_future);

        return (change, purchase_future);
    }
    async function finalize_purchase(
        destination: field,
        nft_commit: field,
        price: u64,
        rand: scalar,
        transfer_future: Future
    ){
        let listing: Listing = listings.get(nft_commit);
        assert_eq(price, listing.price);
        transfer_future.await();
        assert_eq(listing.purchased, false);
        let (buyer_c, purchase_N): 
            (field, group) = encrypt_message(destination, listing.listing_public_key, rand);
        let new_listing: Listing = Listing {
            nft_commit: nft_commit,
            listing_public_key: listing.listing_public_key,
            price: listing.price,
            purchased: true,
            buyer_c: buyer_c,
            purchase_N: purchase_N,
            approved: false
        };
        listings.set(nft_commit, new_listing);
    }


    async transition approve(
        receipt_seller: ReceiptSeller,
        old_nft_view: zgallery_nft.aleo/NFTView,
        c: field,
        N: group,
    ) -> (ReceiptBuyer, zgallery_nft.aleo/NFTView, Future) {
        let buyer : address = decrypt_message(c, N, receipt_seller.listing_private_key) as address ;
        let new_nft_view: zgallery_nft.aleo/NFTView = zgallery_nft.aleo/transfer_nft_view(old_nft_view, buyer);
        let approve_future: Future = finalize_approve(receipt_seller.listing_id);
        let receipt_buyer: ReceiptBuyer = ReceiptBuyer {
            owner: buyer,
            listing_id: receipt_seller.listing_id,
            seller: self.signer
        };

        return (receipt_buyer, new_nft_view, approve_future);
    }
    async function finalize_approve(listing_id: field){
        let listing: Listing = listings.get(listing_id);
        assert_eq(listing.purchased, true);
        assert_eq(listing.approved, false);
        let new_listing: Listing = Listing {
            nft_commit: listing.nft_commit,
            listing_public_key: listing.listing_public_key,
            price: listing.price,
            purchased: listing.purchased,
            buyer_c: listing.buyer_c,
            purchase_N: listing.purchase_N,
            approved: true
        };
        listings.set(listing_id, new_listing);
    }


    async transition reject(
        receipt_seller: ReceiptSeller,
        price: u64,
        c: field,
        N: group,
    ) -> (ReceiptSeller, credits.aleo/credits, Future) {
        let buyer: address = decrypt_message(c, N, receipt_seller.listing_private_key) as address;
        let (change, transfer_future): (
            credits.aleo/credits, Future
        ) = credits.aleo/transfer_public_to_private(buyer, price);
        let reject_future: Future = finalize_reject(receipt_seller.listing_id, price, transfer_future);

        return (receipt_seller, change, reject_future);
    }
    async function finalize_reject(
        nft_commit: field,
        price: u64,
        transfer_future: Future
    ){
        let listing: Listing = listings.get(nft_commit);
        assert_eq(price, listing.price);
        assert_eq(listing.purchased, true);
        assert_eq(listing.approved, false);
        let new_listing: Listing = Listing {
            nft_commit: listing.nft_commit,
            listing_public_key: listing.listing_public_key,
            price: listing.price,
            purchased: false,
            buyer_c: listing.buyer_c,
            purchase_N: listing.purchase_N,
            approved: listing.approved
        };
        listings.set(nft_commit, new_listing);
        transfer_future.await();
    }


    async transition validate(
        receipt_buyer: ReceiptBuyer,
        nft_view: zgallery_nft.aleo/NFTView,
        price: u64,
        form_answer: field
    ) -> (zgallery_nft.aleo/NFT, credits.aleo/credits, DataLog, Future) {
        let nft_commit: field = commit_nft(nft_view.data, nft_view.edition);
        let (nft, nft_future): (
            zgallery_nft.aleo/NFT, Future
            ) = zgallery_nft.aleo/transfer_public_to_private(nft_view, self.signer);
        let (change, transfer_future): (
            credits.aleo/credits, Future
        ) = credits.aleo/transfer_public_to_private(receipt_buyer.seller, price);
        let data_log: DataLog = DataLog {
            owner: nft_view.data.brand,
            nft_commit: nft_commit,
            price: price,
            form_answer: form_answer,
            buyer: receipt_buyer.owner,
            seller: receipt_buyer.seller
        };
        let vld_future: Future = finalize_validate(
            nft_commit,
            price,
            nft_future,
            transfer_future
        );

        return (nft, change, data_log, vld_future);
    }
    async function finalize_validate(
        nft_commit: field,
        price: u64,
        nft_future: Future,
        transfer_future: Future
    ){
        let listing: Listing = listings.get(nft_commit);
        assert_eq(price, listing.price);
        assert_eq(listing.approved, true);
        assert_eq(listing.purchased, true);
        nft_future.await();
        transfer_future.await();
    }

}