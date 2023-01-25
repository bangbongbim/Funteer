package com.yam.funteer.funding.service;

import java.util.List;

import com.yam.funteer.funding.dto.FundingCommentRequest;
import com.yam.funteer.funding.dto.FundingDetailResponse;
import com.yam.funteer.funding.dto.FundingListResponse;
import com.yam.funteer.funding.dto.FundingReportRequest;
import com.yam.funteer.funding.dto.FundingReportResponse;
import com.yam.funteer.funding.dto.FundingRequest;
import com.yam.funteer.funding.exception.PostNotFoundException;
import com.yam.funteer.post.PostType;
import com.yam.funteer.post.entity.Post;

public interface FundingService {
	List<FundingListResponse> findApprovedFunding(String keyword, String category, String hashTag);

	Post createFunding(FundingRequest data);

	FundingDetailResponse findFundingById(Long id);

	FundingDetailResponse updateFunding(Long fundingId, FundingRequest data) throws Exception;

	void deleteFunding(Long fundingId) throws PostNotFoundException;

	void createFundingReport(FundingReportRequest data);

	FundingReportResponse findFundingReportById(Long fundingId);

	FundingReportResponse updateFundingReport(Long fundingId, FundingReportResponse data);

	void createFundingComment(FundingCommentRequest data);
}
