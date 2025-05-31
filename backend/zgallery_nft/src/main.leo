program zgallery_nft.aleo {
    const ADMIN: address = aleo1cfzdk2ynr0v9duzed2aw5g86nv70f8pa8y9mgattnews8guyz5rsnrcy6n;

    struct data {
        metadata: field,
        brand: address,
        form: field
    }

    record NFT {
        private owner: address,
        private data: data,
        private edition: scalar,
    }

    record NFTView {
        private owner: address,
        private data: data,
        private edition: scalar,
        public is_view: bool
    }

    mapping nft_commits: field => bool; 
    // NFT commit => NFT exists or has existed

    mapping nft_owners: field => address;
    // NFT commit => NFT owner


    inline commit_nft(
        nft_data: data,
        nft_edition: scalar
    ) -> field {
        let data_hash: field = BHP256::hash_to_field(nft_data);
        let commitment: field = BHP256::commit_to_field(data_hash, nft_edition);
        return commitment;
    }


    async transition mint_private(
        private nft_data: data,
        private nft_edition: scalar
    ) -> (NFT, Future) {
        let nft: NFT = NFT {
            owner: self.signer,
            data: nft_data,
            edition: nft_edition,
        };
        let nft_commit: field = commit_nft(nft_data, nft_edition);
        let mint_private_future: Future = finalize_mint_private(nft_commit);
        return (nft, mint_private_future);
    }
    async function finalize_mint_private(nft_commit: field){
        let exists: bool = nft_commits.contains(nft_commit);
        assert(!exists);
        nft_commits.set(nft_commit, true);
    }


    transition transfer_private(
        nft: NFT,
        private to: address,
    ) -> NFT {
        return NFT {
            owner: to,
            data: nft.data,
            edition: nft.edition,
        };
    }


    async transition transfer_private_to_public(
        nft: NFT,
        public to: address,
    ) -> (NFTView, Future) {
        let nft_view: NFTView = NFTView {
            owner: to,
            data: nft.data,
            edition: nft.edition,
            is_view: true,
        };
        let nft_commit: field = commit_nft(nft.data, nft.edition);
        let transfer_future: Future = finalize_transfer_pv_to_public(nft_commit, to);

        return (nft_view, transfer_future);
    }
    async function finalize_transfer_pv_to_public(
        nft_commit: field,
        to: address,
    ){
        nft_owners.set(nft_commit, to);
    }


    async transition transfer_private_to_sc(
        nft: NFT,
        public to: address,
    ) -> (NFTView, Future) {
        let nft_view: NFTView = NFTView {
            owner: self.signer,
            data: nft.data,
            edition: nft.edition,
            is_view: true,
        };
        let nft_commit: field = commit_nft(nft.data, nft.edition);
        let transfer_future: Future = finalize_transfer_pv_to_sc(nft_commit, to);

        return (nft_view, transfer_future);
    }
    async function finalize_transfer_pv_to_sc(
        nft_commit: field,
        to: address,
    ){
        nft_owners.set(nft_commit, to);
    }


    async transition transfer_public(
        private old_nft_view: NFTView,
        public to: address,
    ) -> (NFTView, Future) {
        let new_nft_view: NFTView = NFTView {
            owner: to,
            data: old_nft_view.data,
            edition: old_nft_view.edition,
            is_view: true,
        };
        let nft_commit: field = commit_nft(old_nft_view.data, old_nft_view.edition);
        let transfer_future: Future = finalize_transfer_public(
            nft_commit, old_nft_view.owner, to
        );

        return (new_nft_view, transfer_future);
    }
    async function finalize_transfer_public(
        nft_commit: field,
        from: address,
        to: address,
    ){
        let old_owner: address = nft_owners.get(nft_commit);
        assert_eq(old_owner, from);
        nft_owners.set(nft_commit, to);
    }


    async transition transfer_public_to_private(
        private nft_view: NFTView,
        private to: address,
    ) -> (NFT, Future){
        let nft_commit: field = commit_nft(nft_view.data, nft_view.edition);
        let nft: NFT = NFT {
            owner: to,
            data: nft_view.data,
            edition: nft_view.edition,
        };

        let transfer_future: Future = finalize_transfer_public_to_pv(
            nft_commit, self.caller
        );
        return (nft, transfer_future);
    }
    async function finalize_transfer_public_to_pv(
        nft_commit: field,
        from: address,
    ){
        let old_owner: address = nft_owners.get(nft_commit);
        assert_eq(old_owner, from);
        nft_owners.remove(nft_commit);
    }


    transition transfer_nft_view(
        private nft_view: NFTView,
        private to: address,
    ) -> NFTView {
        return NFTView {
            owner: to,
            data: nft_view.data,
            edition: nft_view.edition,
            is_view: true,
        };
    }
}
